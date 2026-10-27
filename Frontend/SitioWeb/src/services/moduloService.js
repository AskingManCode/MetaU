import api from './api';

const moduloService = {
    getAll: () => api.get('/modulo'),
    getById: (id) => api.get(`/modulo/${id}`),
    create: (data) => api.post('/modulo', data),
    update: (id, data) => api.put(`/modulo/${id}`, data),
    delete: (id) => api.delete(`/modulo/${id}`),
};

export default moduloService;