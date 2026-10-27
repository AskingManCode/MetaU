import { createApi } from './api';

const api = createApi(import.meta.env.VITE_URL_ROLES);

const rolService = {
    getAll: () => api.get('/rol'),
    getById: (id) => api.get(`/rol/${id}`),
    create: (data) => api.post('/rol', data),
    update: (id, data) => api.put(`/rol/${id}`, data),
    delete: (id) => api.delete(`/rol/${id}`),
};

export default rolService;
