import { createApi } from './api'

const api = createApi(import.meta.env.VITE_URL_ROLES)

const rolService = {
    getAll: () => api.get('/rol'),
    getPage: (pagina = 1) => api.get('/rol', { params: { pagina } }),
    getById: id => api.get(`/rol/${id}`),
    create: data => api.post('/rol', data),
    update: (id, data) => api.put(`/rol/${id}`, data),
    delete: id => api.delete(`/rol/${id}`),
    getPermisos: id => api.get(`/rol/${id}/modulos`),
    updatePermisos: (id, permisos) => api.put(`/rol/${id}/modulos`, permisos)
}

export default rolService