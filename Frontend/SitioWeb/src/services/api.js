import axios from 'axios';
import { clearAuthSession, readAuthSession } from './authSession';
import { refreshAuthSession } from './authService';

let refreshRequest = null;

const cerrarSesion = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('refreshToken');
    localStorage.removeItem('refresh_token');
    localStorage.removeItem('usuarioId');

    if (typeof window !== 'undefined' && window.location.pathname !== '/login') {
        window.location.assign('/login');
    }
};

const renovarToken = async () => {
    const refreshToken =
        localStorage.getItem('refreshToken') ||
        localStorage.getItem('refresh_token');
    const loginUrl = import.meta.env.VITE_URL_LOGIN;

    if (!refreshToken || !loginUrl) {
        throw new Error('No hay una sesión disponible para renovar');
    }

    const baseUrl = loginUrl.replace(/\/+$/, '');
    const { data } = await axios.post(
        `${baseUrl}/refresh`,
        { refreshToken },
        { headers: { 'Content-Type': 'application/json' } }
    );
    const accessToken = data?.access_token ?? data?.accessToken;
    const nuevoRefreshToken = data?.refresh_token ?? data?.refreshToken;

    if (!accessToken || !nuevoRefreshToken) {
        throw new Error('La respuesta de renovación no contiene los tokens');
    }

    localStorage.setItem('token', accessToken);
    localStorage.setItem('refreshToken', nuevoRefreshToken);

    return accessToken;
};

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
