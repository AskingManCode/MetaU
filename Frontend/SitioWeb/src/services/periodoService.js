
import { createApi } from './api'

const api = createApi(import.meta.env.VITE_URL_PERIODOS)

const periodoService = {
    getAll: () => api.get('/periodo'),
    getPage: (pagina = 1) => api.get('/periodo', { params: { pagina } }),
    getById: periodoId => api.get(`/periodo/${periodoId}`),
    create: data => api.post('/periodo', data),
    update: (periodoId, data) => api.put(`/periodo/${periodoId}`, data),
    delete: periodoId => api.delete(`/periodo/${periodoId}`)
}

export default periodoService
