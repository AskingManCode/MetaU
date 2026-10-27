import api from './api';

const parametroService = {
    getAll: () => api.get('/parametro'),
    getById: (id) => api.get(`/parametro/${id}`),
    create: (data) => api.post('/parametro', data),
    update: (id, data) => api.put(`/parametro/${id}`, data),
    delete: (id) => api.delete(`/parametro/${id}`),
};

export default parametroService;