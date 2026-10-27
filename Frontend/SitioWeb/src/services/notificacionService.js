import { createApi } from './api';

const api = createApi(import.meta.env.VITE_URL_NOTIFICACIONES);

const notificacionService = {
    enviar: (data) => api.post('/api/notificar', data),
};

export default notificacionService;
