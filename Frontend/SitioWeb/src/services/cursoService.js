import api from './api';

const cursoService = {
    getAll: () => api.get('/curso'),
    getById: (id) => api.get(`/curso/${id}`),
    create: (data) => api.post('/curso', data),
    update: (id, data) => api.put(`/curso/${id}`, data),
    delete: (id) => api.delete(`/curso/${id}`),
};

export default cursoService;