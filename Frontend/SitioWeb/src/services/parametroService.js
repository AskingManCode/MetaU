import { createApi } from './api';

const api = createApi(import.meta.env.VITE_URL_PARAMETROS);

const parametroService = {
    getAll: () => api.get('/api/parametro'),
    getById: (parametroCode) => api.get(`/api/parametro/${parametroCode}`),
    create: (data) => api.post('/api/parametro', data),
    update: (parametroCode, data) => api.patch(`/api/parametro/${parametroCode}`, data),
    delete: (parametroCode) => api.delete(`/api/parametro/${parametroCode}`),
};

export default parametroService;
