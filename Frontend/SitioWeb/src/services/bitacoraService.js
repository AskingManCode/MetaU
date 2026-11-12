
import { createApi } from './api'

const api = createApi(import.meta.env.VITE_URL_BITACORAS)

const bitacoraService = {
    getAll: () => api.get('/bitacora'),

    getPage: (pagina = 1) => api.get('/bitacora', {
        params: { pagina }
    }),

    create: data => api.post('/bitacora', data)
}

export default bitacoraService
