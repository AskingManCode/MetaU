
import { createApi } from './api'

const api = createApi(import.meta.env.VITE_URL_PROFESORES)

const profesorService = {
    getAll: () => api.get('/profesor'),
    getPage: (pagina = 1) => api.get('/profesor', { params: { pagina } }),
    getById: profesorId => api.get(`/profesor/${profesorId}`),
    create: data => api.post('/profesor', data),
    update: (profesorId, data) => api.put(`/profesor/${profesorId}`, data),
    delete: profesorId => api.delete(`/profesor/${profesorId}`)
}

export default profesorService
