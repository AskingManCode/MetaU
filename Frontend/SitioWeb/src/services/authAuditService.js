import { createApi } from './api';

export function recordAuthAudit(description, session) {
    try {
        const api = createApi(import.meta.env.VITE_URL_BITACORAS);
        return api.post('/bitacora', { descripcion: description }, {
            headers: {
                Authorization: `Bearer ${session.access_token}`,
                'X-Usuario-Id': session.usuarioID,
            },
        });
    } catch (error) {
        return Promise.reject(error);
    }
}
