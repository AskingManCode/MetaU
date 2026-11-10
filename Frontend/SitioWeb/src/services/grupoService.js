
import { createApi } from './api'

const api = createApi(import.meta.env.VITE_URL_GRUPOS)

const grupoService = {
    getAll: () => api.get('/grupo'),
    getPage: (pagina = 1) => api.get('/grupo', { params: { pagina } }),
    getById: grupoCode => api.get(`/grupo/${encodeURIComponent(grupoCode)}`),
    create: data => api.post('/grupo', data),
    update: (grupoCode, data) => api.put(`/grupo/${encodeURIComponent(grupoCode)}`, data),
    delete: grupoCode => api.delete(`/grupo/${encodeURIComponent(grupoCode)}`)
}

export default grupoService
