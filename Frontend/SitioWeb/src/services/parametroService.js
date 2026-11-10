import { createApi } from './api';

const api = createApi(import.meta.env.VITE_URL_PARAMETROS);

const parametroService = {
    getAll: () => api.get('/parametro'),
    getById: parametroCode =>
        api.get(`/parametro/${encodeURIComponent(parametroCode)}`),
    create: data => api.post('/parametro', data),
    update: (parametroCode, data) =>
        api.patch(`/parametro/${encodeURIComponent(parametroCode)}`, data),
    delete: parametroCode =>
        api.delete(`/parametro/${encodeURIComponent(parametroCode)}`),
};

export default parametroService;
