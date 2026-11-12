import { createApi } from './api';

const api = createApi(import.meta.env.VITE_URL_DIRECCIONES);

const direccionService = {
    getProvincias: () => api.get('/api/provincias'),
    getCantones: (provinciaId) => api.get(`/api/cantones/${provinciaId}`),
    getDistritos: (provinciaId, cantonId) => api.get(`/api/distritos/${provinciaId}/${cantonId}`),
};

export default direccionService;
