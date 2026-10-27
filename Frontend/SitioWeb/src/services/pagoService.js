import { createApi } from './api';

const api = createApi(import.meta.env.VITE_URL_PAGOS);

const pagoService = {
    getById: (pagoId) => api.get(`/pago/${pagoId}`),
    getByPeriodo: (periodoId) => api.get(`/pago/periodo/${periodoId}`),
    create: (facturaId, data) => api.post(`/pago/${facturaId}`, data),
    reversar: (pagoId) => api.patch(`/pago/${pagoId}`),
};

export default pagoService;
