import { createApi } from './api';

const api = createApi(import.meta.env.VITE_URL_LISTA_ESTUDIANTES);

const listaEstudiantesService = {
    getByPeriodo: (periodo) => api.get('/listadoestudiantes', { params: { periodo } }),
};

export default listaEstudiantesService;
