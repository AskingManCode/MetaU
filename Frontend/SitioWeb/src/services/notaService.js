import api from './api';

const notaService = {
    getAll: () => api.get('/nota'),
    getById: (id) => api.get(`/nota/${id}`),
    create: (data) => api.post('/nota', data),
    update: (id, data) => api.put(`/nota/${id}`, data),
    delete: (id) => api.delete(`/nota/${id}`),
};

export default notaService;