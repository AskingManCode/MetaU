import { createApi } from './api';

const api = createApi(import.meta.env.VITE_URL_INSTITUCIONES);

const institucionService = {
    getAll: () => api.get('/institucion'),
    getById: (id) => api.get(`/institucion/${id}`),
    create: (data) => api.post('/institucion', data),
    update: (id, data) => api.put(`/institucion/${id}`, data),
    delete: (id) => api.delete(`/institucion/${id}`),
};

export default institucionService;
