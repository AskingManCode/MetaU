import { createApi } from './api'

const api = createApi(import.meta.env.VITE_URL_FACTURACION)

const facturaService = {
    getById: facturaId => api.get(`/api/factura/${encodeURIComponent(facturaId)}`),
    getByPeriodo: periodoId => api.get(`/api/factura/periodo/${encodeURIComponent(periodoId)}`),
    create: data => api.post('/api/factura', data),
    anular: (facturaId, data) => {
        const payload = typeof data === 'string' ? { motivo: data } : data
        return api.patch(`/api/factura/${encodeURIComponent(facturaId)}`, payload)
    }
}

export default facturaService
