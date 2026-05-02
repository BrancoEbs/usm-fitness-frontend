import axios from 'axios';

const api = axios.create({
    baseURL: 'http://localhost:8000/api/', // La URL de tu backend en Django
});

// Interceptor: Automáticamente le pega el Token a todas tus peticiones
api.interceptors.request.use((config) => {
    const token = localStorage.getItem('access_token');
    if (token) {
        config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
});

// NUEVO: Interceptor Response: Maneja tokens vencidos
api.interceptors.response.use(
    (response) => response,
    (error) => {
        if (error.response && error.response.status === 401) {
            // El token expiró o es inválido. Limpiamos y redirigimos.
            localStorage.removeItem('access_token');
            // Usamos window.location para forzar una recarga limpia hacia el login
            window.location.href = '/login'; 
        }
        return Promise.reject(error);
    }
);

export default api;