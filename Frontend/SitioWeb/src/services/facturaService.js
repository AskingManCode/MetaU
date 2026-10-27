import { createApi } from './api';

const api = createApi(import.meta.env.VITE_URL_FACTURACION);

const facturaService = {
    getById: (facturaId) => api.get(`/api/factura/${facturaId}`),
    getByPeriodo: (periodoId) => api.get(`/api/factura/periodo/${periodoId}`),
    create: (data) => api.post('/api/factura', data),
    anular: (facturaId) => api.patch(`/api/factura/${facturaId}`),
};

export default facturaService;
