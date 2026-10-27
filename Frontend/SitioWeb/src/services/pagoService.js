import api from './api';

const pagoService = {
    getAll: () => api.get('/pago'),
    getById: (id) => api.get(`/pago/${id}`),
    create: (data) => api.post('/pago', data),
    update: (id, data) => api.put(`/pago/${id}`, data),
    delete: (id) => api.delete(`/pago/${id}`),
};

export default pagoService;