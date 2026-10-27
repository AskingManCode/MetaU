import api from './api';

const facturaService = {
    getAll: () => api.get('/factura'),
    getById: (id) => api.get(`/factura/${id}`),
    create: (data) => api.post('/factura', data),
    update: (id, data) => api.put(`/factura/${id}`, data),
    delete: (id) => api.delete(`/factura/${id}`),
};

export default facturaService;