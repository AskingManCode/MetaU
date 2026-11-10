import axios from 'axios'
import { createApi } from './api'

let refreshRequest = null

const cerrarSesion = () => {
    localStorage.removeItem('token')
    localStorage.removeItem('refreshToken')
    localStorage.removeItem('refresh_token')
    localStorage.removeItem('usuarioId')
    localStorage.removeItem('usuarioID')
    localStorage.removeItem('UsuarioGUID')

    if (window.location.pathname !== '/login') {
        window.location.assign('/login')
    }
}

const renovarToken = async () => {
    const refreshToken =
        localStorage.getItem('refreshToken') ||
        localStorage.getItem('refresh_token')
    const loginUrl = import.meta.env.VITE_URL_LOGIN

    if (!refreshToken || !loginUrl) {
        throw new Error('No hay una sesión disponible para renovar.')
    }

    const { data } = await axios.post(
        `${loginUrl.replace(/\/+$/, '')}/refresh`,
        { refreshToken },
        { headers: { 'Content-Type': 'application/json' } }
    )
    const accessToken = data?.access_token ?? data?.accessToken
    const nuevoRefreshToken = data?.refresh_token ?? data?.refreshToken

    if (!accessToken || !nuevoRefreshToken) {
        throw new Error('La respuesta de renovación no contiene los tokens.')
    }

    localStorage.setItem('token', accessToken)
    localStorage.setItem('refreshToken', nuevoRefreshToken)

    return accessToken
}

const crearApiModulo = baseUrl => {
    const api = createApi(baseUrl)

    api.interceptors.request.use(config => {
        const usuarioId =
            localStorage.getItem('usuarioId') ||
            localStorage.getItem('usuarioID') ||
            localStorage.getItem('UsuarioGUID')

        if (usuarioId) {
            config.headers['X-Usuario-Id'] = usuarioId
        }

        return config
    })

    api.interceptors.response.use(
        response => response,
        async error => {
            const config = error.config

            if (error.response?.status !== 401 || !config) {
                return Promise.reject(error)
            }

            if (config._cursoAuthRetry) {
                cerrarSesion()
                return Promise.reject(error)
            }

            config._cursoAuthRetry = true

            try {
                const solicitud = refreshRequest || (refreshRequest = renovarToken())
                const token = await solicitud

                if (refreshRequest === solicitud) {
                    refreshRequest = null
                }

                config.headers = config.headers || {}
                config.headers.Authorization = `Bearer ${token}`

                return api(config)
            } catch {
                refreshRequest = null
                cerrarSesion()
                return Promise.reject(error)
            }
        }
    )

    return api
}

const cursosApi = crearApiModulo(import.meta.env.VITE_URL_CURSOS)
const carrerasApi = crearApiModulo(import.meta.env.VITE_URL_CARRERAS)
const gruposApi = crearApiModulo(import.meta.env.VITE_URL_GRUPOS)

const cursoModuleServices = {
    getCursos: pagina => cursosApi.get('/curso', {
        params: pagina ? { pagina } : undefined
    }),
    getCursosPorCarrera: (carreraCode, pagina) =>
        cursosApi.get(`/curso/carrera/${encodeURIComponent(carreraCode)}`, {
            params: pagina ? { pagina } : undefined
        }),
    getCurso: cursoCode =>
        cursosApi.get(`/curso/${encodeURIComponent(cursoCode)}`),
    crearCurso: datos => cursosApi.post('/curso', datos),
    actualizarCurso: (cursoCode, datos) =>
        cursosApi.put(`/curso/${encodeURIComponent(cursoCode)}`, datos),
    eliminarCurso: cursoCode =>
        cursosApi.delete(`/curso/${encodeURIComponent(cursoCode)}`),
    getCarreras: () => carrerasApi.get('/carrera'),
    getGrupos: pagina => gruposApi.get('/grupo', {
        params: pagina ? { pagina } : undefined
    })
}

export default cursoModuleServices
