import api from './api';

const notificacionService = {
  enviar: (data) => api.post('/notificar', data),
};

export default notificacionService;