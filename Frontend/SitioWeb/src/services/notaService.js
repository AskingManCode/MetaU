
import { createApi } from './api'

const api = createApi(import.meta.env.VITE_URL_NOTAS)

const notasService = {
    obtenerDesglose: grupoCode =>
        api.get('/obtenerdesglose', {
            params: { grupoCode }
        }),

    cargarDesglose: datos =>
        api.post('/cargardesglose', datos),

    obtenerNotas: (identificacion, grupoCode) =>
        api.get('/obtenernotas', {
            params: {
                identificacion,
                grupoCode
            }
        }),

    asignarNota: datos =>
        api.post('/asignarnotarubro', datos),

    modificarNota: datos =>
        api.put('/asignarnotarubro', datos)
}

export default notasService
