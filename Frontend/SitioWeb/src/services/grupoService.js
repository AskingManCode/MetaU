import api from './api';

const grupoService = {
    getAll: () => api.get('/grupo'),
    getById: (id) => api.get(`/grupo/${id}`),
    create: (data) => api.post('/grupo', data),
    update: (id, data) => api.put(`/grupo/${id}`, data),
    delete: (id) => api.delete(`/grupo/${id}`),
};

export default grupoService;