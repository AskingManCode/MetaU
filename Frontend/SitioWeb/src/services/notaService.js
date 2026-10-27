import { createApi } from './api';

const api = createApi(import.meta.env.VITE_URL_NOTAS);

const notaService = {
    getDesglose: (grupoCode) => api.get('/obtenerdesglose', { params: { grupoCode } }),
    getNotas: (identificacion, grupoCode) => api.get('/obtenernotas', { params: { identificacion, grupoCode } }),
    cargarDesglose: (data) => api.post('/cargardesglose', data),
    asignarNotaRubro: (data) => api.post('/asignarnotarubro', data),
    actualizarNotaRubro: (data) => api.put('/asignarnotarubro', data),
};

export default notaService;
