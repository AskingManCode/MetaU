import { createApi } from './api';

const api = createApi(import.meta.env.VITE_URL_EXPEDIENTES);

const expedienteService = {
    getAll: () => api.get('/expediente'),
    getById: (identificacion) => api.get(`/expediente/${identificacion}`),
    create: (data) => api.post('/expediente', data),
    update: (identificacion, data) => api.put(`/expediente/${identificacion}`, data),
    delete: (identificacion) => api.delete(`/expediente/${identificacion}`),
};

export default expedienteService;
