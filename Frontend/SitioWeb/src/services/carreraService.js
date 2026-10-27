import api from './api';

const carreraService = {
    getAll: () => api.get('/carrera'),
    getById: (id) => api.get(`/carrera/${id}`),
    create: (data) => api.post('/carrera', data),
    update: (id, data) => api.put(`/carrera/${id}`, data),
    delete: (id) => api.delete(`/carrera/${id}`),
};

export default carreraService;