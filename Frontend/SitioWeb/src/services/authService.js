import axios from 'axios';
import {
    readAuthSession,
    saveAuthSession,
} from './authSession';

const authApi = axios.create({
    headers: { 'Content-Type': 'application/json' },
});

function getLoginUrl() {
    const baseUrl = import.meta.env.VITE_URL_LOGIN;
    if (!baseUrl) throw new Error('Falta configurar la URL del servicio de login');
    return baseUrl.replace(/\/+$/, '');
}

const guardarTokens = (datos, usuarioId) => {
    const token = datos?.access_token ?? datos?.accessToken;
    const refreshToken = datos?.refresh_token ?? datos?.refreshToken;

    if (!token || !refreshToken) {
        throw new Error('La respuesta de autenticación no contiene los tokens');
    }

    localStorage.setItem('token', token);
    localStorage.setItem('refreshToken', refreshToken);

    if (usuarioId) {
        localStorage.setItem('usuarioId', usuarioId);
    }
};

const authService = {
    login: (email, password) => authApi.post(`${getLoginUrl()}/login`, undefined, {
        headers: {
            usuario: email,
            contrasena: password,
        },
    }),
    refresh: (refreshToken) => authApi.post(
        `${getLoginUrl()}/refresh`,
        { refreshToken },
    ),
    validate: (accessToken) => authApi.post(`${getLoginUrl()}/validate`, undefined, {
        headers: { Authorization: `Bearer ${accessToken}` },
    }),
};

let refreshPromise = null;

export function refreshAuthSession() {
    if (!refreshPromise) {
        const currentSession = readAuthSession();
        if (!currentSession?.refresh_token) {
            return Promise.reject(new Error('No hay un refresh token disponible'));
        }

        refreshPromise = authService.refresh(currentSession.refresh_token)
            .then(({ data }) => {
                if (!data?.access_token || !data?.refresh_token || !data?.expires_in) {
                    throw new Error('La respuesta de renovación no contiene los tokens requeridos');
                }
                const activeSession = readAuthSession();
                if (activeSession?.refresh_token !== currentSession.refresh_token) {
                    throw new Error('La sesión cambió durante la renovación');
                }

                saveAuthSession({
                    ...currentSession,
                    ...data,
                    usuarioID: data.usuarioID ?? currentSession.usuarioID,
                }, currentSession.rememberMe);
                return readAuthSession();
            })
            .finally(() => {
                refreshPromise = null;
            });
    }

    return refreshPromise;
}

export default authService;
