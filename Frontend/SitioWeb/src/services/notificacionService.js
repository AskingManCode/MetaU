import { createApi } from './api';

// Normalizar la URL base para evitar duplicación del segmento /api
const rawUrl = import.meta.env.VITE_URL_NOTIFICACIONES || '';
const baseUrl = rawUrl.replace(/\/api\/?$/, '');

const api = createApi(baseUrl);

const notificacionService = {
    // Obtener historial paginado (según PAGSIZE de MicroservicioParametros)
    getPage: (pagina = 1) => api.get('/api/notificar', { params: { pagina } }),

    // Obtener historial completo sin paginar
    getAll: () => api.get('/api/notificar'),

    // Obtener una notificación por su ID
    getById: async (id) => {
        const { data } = await api.get('/api/notificar');
        const lista = Array.isArray(data) ? data : data?.datos ?? [];
        const encontrada = lista.find(n => String(n.notificacionID || n.NotificacionID) === String(id));
        if (!encontrada) {
            throw new Error(`No se encontró la notificación #${id}`);
        }
        return { data: encontrada };
    },

    // Enviar notificación a un único destinatario
    enviar: (data) => api.post('/api/notificar', data),

    // Enviar notificación a múltiples destinatarios
    enviarMultiple: (data) => api.post('/api/notificar/multiple', data),
};

export default notificacionService;
