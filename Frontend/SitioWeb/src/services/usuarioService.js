import api from './api';

const usuarioService = {
    getAll: (params) => api.get('/usuario', { params }),
    getByEmail: (email) => api.get(`/usuario/${email}`),
    create: (data) => api.post('/usuario', data),
    update: (email, data) => api.put(`/usuario/${email}`, data),
    delete: (email) => api.delete(`/usuario/${email}`),
};

export default usuarioService;