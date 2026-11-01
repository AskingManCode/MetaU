import { createApi } from './api';

const api = createApi(import.meta.env.VITE_URL_LOGIN);

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
    login: async credentials => {
        const usuario =
            credentials?.usuario ??
            credentials?.username ??
            credentials?.email;
        const contrasena =
            credentials?.contrasena ??
            credentials?.password;

        if (!usuario || !contrasena) {
            throw new Error('Debe proporcionar usuario y contraseña');
        }

        const respuesta = await api.post('/login', null, {
            headers: { usuario, contrasena }
        });

        if (!respuesta.data?.usuarioID) {
            throw new Error('La respuesta de autenticación no contiene el usuario');
        }

        guardarTokens(respuesta.data, respuesta.data.usuarioID);
        return respuesta;
    },
    refresh: async refreshToken => {
        const respuesta = await api.post('/refresh', { refreshToken });
        guardarTokens(respuesta.data);
        return respuesta;
    },
    validate: () => api.post('/validate'),
};

export default authService;
