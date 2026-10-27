import api from './api';

const expedienteService = {
    getAll: () => api.get('/expediente'),
    getById: (id) => api.get(`/expediente/${id}`),
    create: (data) => api.post('/expediente', data),
    update: (id, data) => api.put(`/expediente/${id}`, data),
    delete: (id) => api.delete(`/expediente/${id}`),
};

export default expedienteService;