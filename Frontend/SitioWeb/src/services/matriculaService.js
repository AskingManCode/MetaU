import api from './api';

const matriculaService = {
    getAll: () => api.get('/matricula'),
    getById: (id) => api.get(`/matricula/${id}`),
    create: (data) => api.post('/matricula', data),
    update: (id, data) => api.put(`/matricula/${id}`, data),
    delete: (id) => api.delete(`/matricula/${id}`),
};

export default matriculaService;