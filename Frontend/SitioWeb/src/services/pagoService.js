import { createApi } from './api'

const api = createApi(import.meta.env.VITE_URL_PAGOS)

const pagoService = {
    getById: pagoId => api.get(`/api/pago/${encodeURIComponent(pagoId)}`),
    getByPeriodo: periodoId => api.get(`/api/pago/periodo/${encodeURIComponent(periodoId)}`),
    create: facturaId => api.post(`/api/pago/${encodeURIComponent(facturaId)}`),
    reversar: (pagoId, data) => {
        const payload = typeof data === 'string' ? { motivo: data } : data
        return api.patch(`/api/pago/${encodeURIComponent(pagoId)}`, payload)
    }
}

export default pagoService
