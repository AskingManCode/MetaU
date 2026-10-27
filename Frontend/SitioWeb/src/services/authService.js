import { createApi } from './api';

const api = createApi(import.meta.env.VITE_URL_LOGIN);

const authService = {
    login: (credentials) => api.post('/login', credentials),
    refresh: (refreshToken) => api.post('/refresh', { refreshToken }),
    validate: () => api.post('/validate'),
};

export default authService;
