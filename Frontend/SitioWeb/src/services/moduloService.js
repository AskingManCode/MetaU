import { createApi } from './api';

const api = createApi(import.meta.env.VITE_URL_MODULOS);

const moduloService = {
    getAll: () => api.get('/modulo'),
    getById: (id) => api.get(`/modulo/${id}`),
    create: (data) => api.post('/modulo', data),
    update: (id, data) => api.put(`/modulo/${id}`, data),
    delete: (id) => api.delete(`/modulo/${id}`),
};

export default moduloService;
