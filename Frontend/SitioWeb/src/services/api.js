import axios from 'axios';

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
        const token = localStorage.getItem('token');
        const usuarioId = localStorage.getItem('usuarioId');

        if (token) config.headers.Authorization = `Bearer ${token}`;

        if (usuarioId) {
            config.headers['X-Usuario-Id'] = usuarioId;
            config.headers['UsuarioGUID'] = usuarioId;
        }
        return config;
    });

    api.interceptors.response.use(
        response => response,
        async error => {
            const config = error.config;

            if (
                error.response?.status !== 401 ||
                !config ||
                /\/(?:login|refresh)\/?$/i.test(config.url || '')
            ) {
                return Promise.reject(error);
            }

            if (config._authRetry) {
                cerrarSesion();
                return Promise.reject(error);
            }

            config._authRetry = true;

            try {
                const solicitudRenovacion =
                    refreshRequest || (refreshRequest = renovarToken());
                const token = await solicitudRenovacion;

                if (refreshRequest === solicitudRenovacion) {
                    refreshRequest = null;
                }

                config.headers = config.headers || {};
                config.headers.Authorization = `Bearer ${token}`;

                return api(config);
            } catch {
                refreshRequest = null;
                cerrarSesion();
                return Promise.reject(error);
            }
        }
    );

    return api;
};
