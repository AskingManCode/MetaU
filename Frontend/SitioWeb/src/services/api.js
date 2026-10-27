import axios from 'axios';

export const createApi = (baseURL) => {
    if (!baseURL) throw new Error('Falta configurar la URL de un microservicio');

    const api = axios.create({
        baseURL,
        headers: { 'Content-Type': 'application/json' },
    });

    api.interceptors.request.use((config) => {
        const token = localStorage.getItem('token');
        const usuarioId = localStorage.getItem('usuarioId');

        if (token) config.headers.Authorization = `Bearer ${token}`;

        if (usuarioId) {
            config.headers['X-Usuario-Id'] = usuarioId;
            config.headers['UsuarioGUID'] = usuarioId;
        }
        return config;
    });

    return api;
};
