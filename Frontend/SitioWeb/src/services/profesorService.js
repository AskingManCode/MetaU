import api from './api';

const profesorService = {
    getAll: () => api.get('/profesor'),
    getById: (id) => api.get(`/profesor/${id}`),
    create: (data) => api.post('/profesor', data),
    update: (id, data) => api.put(`/profesor/${id}`, data),
    delete: (id) => api.delete(`/profesor/${id}`),
};

export default profesorService;