import { createApi } from './api';

const api = createApi(import.meta.env.VITE_URL_HISTORIAL_ACADEMICO);

const historialAcademicoService = {
    // params: { tipoIdentificacion, identificacion }
    get: (params) => api.get('/historialacademico', { params }),
};

export default historialAcademicoService;
