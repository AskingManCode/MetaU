import axios from 'axios';
import { clearAuthSession, readAuthSession } from './authSession';
import { refreshAuthSession } from './authService';

export const createApi = (baseURL) => {
    if (!baseURL) throw new Error('Falta configurar la URL de un microservicio');

    const api = axios.create({
        baseURL,
        headers: { 'Content-Type': 'application/json' },
    });

    api.interceptors.request.use((config) => {
        const session = readAuthSession();

        if (session?.access_token) {
            config.headers.Authorization = `Bearer ${session.access_token}`;
        }

        if (session?.usuarioID) {
            config.headers['X-Usuario-Id'] = session.usuarioID;
            config.headers['UsuarioGUID'] = session.usuarioID;
        }
        return config;
    });

    api.interceptors.response.use(
        (response) => response,
        async (error) => {
            const request = error.config;
            if (error.response?.status === 401 && request?._retry) {
                clearAuthSession();
                if (typeof window !== 'undefined') {
                    window.dispatchEvent(new Event('auth:session-expired'));
                }
                return Promise.reject(error);
            }

            if (
                error.response?.status !== 401
                || !request
            ) {
                return Promise.reject(error);
            }

            request._retry = true;

            try {
                const session = await refreshAuthSession();
                request.headers.Authorization = `Bearer ${session.access_token}`;
                return api(request);
            } catch (refreshError) {
                clearAuthSession();
                if (typeof window !== 'undefined') {
                    window.dispatchEvent(new Event('auth:session-expired'));
                }
                return Promise.reject(refreshError);
            }
        },
    );

    return api;
};
