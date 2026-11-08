import axios from 'axios';

// URL de la API definida al compilar (variable VITE_API_URL). Ver .env.example
const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000/api/';

const api = axios.create({
    baseURL: API_URL,
});

const limpiarSesion = () => {
    localStorage.removeItem('access_token');
    localStorage.removeItem('refresh_token');
};

// Cierra la sesión también en el servidor (invalida el refresh token)
export const cerrarSesion = async () => {
    const refresh = localStorage.getItem('refresh_token');
    if (refresh) {
        try {
            await axios.post(`${API_URL}token/logout/`, { refresh });
        } catch {
            // Si el token ya expiró no hay nada que invalidar
        }
    }
    limpiarSesion();
};

// Inyecta el token de acceso en cada solicitud
api.interceptors.request.use((config) => {
    const token = localStorage.getItem('access_token');
    if (token) {
        config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
});

// Renovación automática del token de acceso (dura 30 minutos)
let renovacionEnCurso = null;

const renovarToken = async () => {
    const refresh = localStorage.getItem('refresh_token');
    if (!refresh) throw new Error('Sin refresh token');
    const res = await axios.post(`${API_URL}token/refresh/`, { refresh });
    localStorage.setItem('access_token', res.data.access);
    if (res.data.refresh) {
        // El backend rota el refresh token en cada renovación
        localStorage.setItem('refresh_token', res.data.refresh);
    }
    return res.data.access;
};

api.interceptors.response.use(
    (response) => response,
    async (error) => {
        const original = error.config;
        const esLogin = original?.url?.startsWith('token/');

        if (error.response?.status === 401 && original && !original._reintento && !esLogin) {
            original._reintento = true;
            try {
                renovacionEnCurso = renovacionEnCurso || renovarToken();
                const nuevoToken = await renovacionEnCurso;
                renovacionEnCurso = null;
                original.headers.Authorization = `Bearer ${nuevoToken}`;
                return api(original);
            } catch {
                renovacionEnCurso = null;
                limpiarSesion();
                window.location.href = '/login';
            }
        }
        return Promise.reject(error);
    }
);

export default api;
