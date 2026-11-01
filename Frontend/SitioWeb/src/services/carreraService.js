import { createApi } from './api';

const api = createApi(import.meta.env.VITE_URL_CARRERAS);

const carreraService = {
    getAll: () => api.get('/carrera'),
    getPage: (pagina) => api.get('/carrera', { params: { pagina } }),
    getById: (id) => api.get(`/carrera/${id}`),
    getByInstitucion: (institucionId) => api.get(`/carrera/institucion/${institucionId}`),
    getPageByInstitucion: (institucionId, pagina) => api.get(
        `/carrera/institucion/${encodeURIComponent(institucionId)}`,
        { params: { pagina } }
    ),
    create: (data) => api.post('/carrera', data),
    update: (id, data) => api.put(`/carrera/${id}`, data),
    delete: (id) => api.delete(`/carrera/${id}`),
};

export default carreraService;
