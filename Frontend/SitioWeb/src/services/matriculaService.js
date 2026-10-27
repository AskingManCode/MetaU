import { createApi } from './api';

const api = createApi(import.meta.env.VITE_URL_MATRICULAS);

const matriculaService = {
    // params opcionales: { cursoCode, grupoCode, identificacion }
    getAll: (params) => api.get('/matricula', { params }),
    create: (data) => api.post('/matricula', data),
    update: (id, data) => api.put(`/matricula/${id}`, data),
    delete: (id) => api.delete(`/matricula/${id}`),
};

export default matriculaService;
