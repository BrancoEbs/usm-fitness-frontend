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

export default api;