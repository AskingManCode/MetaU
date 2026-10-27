import api from './api';

const periodoService = {
    getAll: () => api.get('/periodo'),
    getById: (id) => api.get(`/periodo/${id}`),
    create: (data) => api.post('/periodo', data),
    update: (id, data) => api.put(`/periodo/${id}`, data),
    delete: (id) => api.delete(`/periodo/${id}`),
};

export default periodoService;