import { createApi } from './api';

const api = createApi(import.meta.env.VITE_URL_PREMATRICULAS);

const prematriculaService = {
    getAll: () => api.get('/prematricula'),
    getById: (id) => api.get(`/prematricula/${id}`),
    create: (data) => api.post('/prematricula', data),
    update: (id, data) => api.put(`/prematricula/${id}`, data),
    delete: (id) => api.delete(`/prematricula/${id}`),
};

export default prematriculaService;
