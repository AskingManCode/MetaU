import axios from 'axios'
import { createApi } from './api'

const usuariosApi = createApi(import.meta.env.VITE_URL_USUARIOS)
const parametrosApi = createApi(import.meta.env.VITE_URL_PARAMETROS)
const authApi = axios.create({
    headers: { 'Content-Type': 'application/json' }
})

let refreshPromise = null

const getStoredValue = (...keys) => {
    for (const storage of [localStorage, sessionStorage]) {
        for (const key of keys) {
            const value = storage.getItem(key)
            if (value) return value
        }
    }

    return ''
}

const getEmailFromToken = token => {
    try {
        const encodedPayload = token.split('.')[1]
        const normalized = encodedPayload.replace(/-/g, '+').replace(/_/g, '/')
        const payload = JSON.parse(
            atob(normalized.padEnd(Math.ceil(normalized.length / 4) * 4, '='))
        )
        return payload.email ||
            payload['http://schemas.xmlsoap.org/ws/2005/05/identity/claims/emailaddress'] ||
            (payload.sub?.includes('@') ? payload.sub : '')
    } catch {
        return ''
    }
}

const readSession = () => {
    const token = getStoredValue('token', 'access_token')

    return {
        token,
        refreshToken: getStoredValue('refreshToken', 'refresh_token'),
        usuarioId: getStoredValue('usuarioId', 'usuarioID', 'UsuarioGUID'),
        email: getStoredValue('email') || getEmailFromToken(token),
        storage: localStorage.getItem('token') || localStorage.getItem('access_token')
            ? localStorage
            : sessionStorage
    }
}

const saveTokens = (data, originalSession) => {
    const storage = originalSession.storage
    const token = data?.access_token ?? data?.accessToken
    const refreshToken = data?.refresh_token ?? data?.refreshToken
    if (!token || !refreshToken) {
        throw new Error('La respuesta de autenticación no contiene los tokens requeridos.')
    }

    storage.setItem('token', token)
    storage.setItem('refreshToken', refreshToken)
    storage.setItem('email', originalSession.email)
    const usuarioId = data.usuarioID ?? originalSession.usuarioId
    if (usuarioId) storage.setItem('usuarioId', usuarioId)
}

const expireLocalSession = () => {
    const keys = [
        'token',
        'refreshToken',
        'refresh_token',
        'access_token',
        'expires_in',
        'usuarioId',
        'usuarioID',
        'UsuarioGUID',
        'email'
    ]

    keys.forEach(key => {
        localStorage.removeItem(key)
        sessionStorage.removeItem(key)
    })
    window.location.assign('/login')
}

const refreshAccessToken = async () => {
    const refreshToken =
        localStorage.getItem('refreshToken') ||
        localStorage.getItem('refresh_token') ||
        sessionStorage.getItem('refreshToken') ||
        sessionStorage.getItem('refresh_token')
    const loginUrl = import.meta.env.VITE_URL_LOGIN

    if (!refreshToken || !loginUrl) {
        throw new Error('No hay una sesión disponible para renovar.')
    }

    const { data } = await authApi.post(
        `${loginUrl.replace(/\/+$/, '')}/refresh`,
        { refreshToken }
    )
    const accessToken = data?.access_token ?? data?.accessToken
    const newRefreshToken = data?.refresh_token ?? data?.refreshToken

    if (!accessToken || !newRefreshToken) {
        throw new Error('La respuesta de renovación no contiene los tokens.')
    }

    const storage = localStorage.getItem('token') ||
        localStorage.getItem('access_token')
        ? localStorage
        : sessionStorage
    storage.setItem('token', accessToken)
    storage.setItem('refreshToken', newRefreshToken)

    if (data.usuarioID) {
        storage.setItem('usuarioId', data.usuarioID)
    }

    return accessToken
}

const installRefreshHandler = api => {
    api.interceptors.request.use(config => {
        const session = readSession()
        if (session.token) {
            config.headers.Authorization = `Bearer ${session.token}`
        }
        if (session.usuarioId) {
            config.headers['X-Usuario-Id'] = session.usuarioId
            config.headers.UsuarioGUID = session.usuarioId
        }
        return config
    })

    api.interceptors.response.use(
        response => response,
        async error => {
            const request = error.config
            if (error.response?.status !== 401 || !request) {
                return Promise.reject(error)
            }

            if (request._adm24Retry) {
                expireLocalSession()
                return Promise.reject(error)
            }

            request._adm24Retry = true

            try {
                const pendingRefresh = refreshPromise || (refreshPromise = refreshAccessToken())
                const accessToken = await pendingRefresh
                if (refreshPromise === pendingRefresh) refreshPromise = null

                request.headers = request.headers || {}
                request.headers.Authorization = `Bearer ${accessToken}`
                return api(request)
            } catch (refreshError) {
                refreshPromise = null
                expireLocalSession()
                return Promise.reject(refreshError)
            }
        }
    )
}

installRefreshHandler(usuariosApi)
installRefreshHandler(parametrosApi)

const getLoginUrl = () => {
    const loginUrl = import.meta.env.VITE_URL_LOGIN
    if (!loginUrl) throw new Error('Falta configurar la URL del servicio de login.')
    return loginUrl.replace(/\/+$/, '')
}

const miPerfilService = {
    getPerfil: email =>
        usuariosApi.get(`/usuario/${encodeURIComponent(email)}`),
    actualizarContrasena: (email, datos) =>
        usuariosApi.put(`/usuario/${encodeURIComponent(email)}`, datos),
    getParametro: codigo =>
        parametrosApi.get(`/api/parametro/${encodeURIComponent(codigo)}`),
    verifyPassword: (email, password) =>
        authApi.post(`${getLoginUrl()}/login`, undefined, {
            headers: {
                usuario: email,
                contrasena: password
            }
        }),
    registerLogout: (usuarioId, token) => {
        const bitacorasApi = createApi(import.meta.env.VITE_URL_BITACORAS)
        return bitacorasApi.post(
            '/bitacora',
            { descripcion: 'El usuario cerró sus sesiones' },
            {
                headers: {
                    Authorization: `Bearer ${token}`,
                    'X-Usuario-Id': usuarioId
                }
            }
        )
    },
    clearLocalSession: expireLocalSession,
    readSession,
    saveTokens
}

export default miPerfilService
