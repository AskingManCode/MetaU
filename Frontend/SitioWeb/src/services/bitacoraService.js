import api from './api';

const bitacoraService = {
    getAll: () => api.get('/bitacora'),
    getById: (id) => api.get(`/bitacora/${id}`),
};

export default bitacoraService;