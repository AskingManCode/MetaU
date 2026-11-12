import { createApi } from './api';

const api = createApi(import.meta.env.VITE_URL_CURSOS);

const cursoService = {
    getAll: () => api.get('/curso'),
    getById: cursoCode => api.get(`/curso/${encodeURIComponent(cursoCode)}`),
    getByCarrera: carreraCode =>
        api.get(`/curso/carrera/${encodeURIComponent(carreraCode)}`),
    create: (data) => api.post('/curso', data),
    update: (cursoCode, data) =>
        api.put(`/curso/${encodeURIComponent(cursoCode)}`, data),
    delete: cursoCode => api.delete(`/curso/${encodeURIComponent(cursoCode)}`),
};

export default cursoService;
