import { createApi } from './api';

const api = createApi(import.meta.env.VITE_URL_GRUPOS);

const grupoService = {
    getAll: () => api.get('/grupo'),
    getById: (grupoCode) => api.get(`/grupo/${grupoCode}`),
    create: (data) => api.post('/grupo', data),
    update: (grupoCode, data) => api.put(`/grupo/${grupoCode}`, data),
    delete: (grupoCode) => api.delete(`/grupo/${grupoCode}`),
};

export default grupoService;
