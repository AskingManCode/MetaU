import { createApi } from './api'

const api = createApi(import.meta.env.VITE_URL_HISTORIAL_ACADEMICO)

const historialAcademicoService = {
  consultar: async (tipoIdentificacion, identificacion) => {
    const response = await api.get('/historialacademico', {
      params: { tipoIdentificacion, identificacion },
    })
    return response.data
  },
}

export default historialAcademicoService
