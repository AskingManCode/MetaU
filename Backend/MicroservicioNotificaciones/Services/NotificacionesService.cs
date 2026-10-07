using MicroservicioNotificaciones.Entities;

namespace MicroservicioNotificaciones.Services
{
    public class NotificacionesService : INotificacionesService
    {
        public Task<NotificarResponse> EnviarCorreoAsync(NotificarRequest request)
        {
            throw new NotImplementedException("El envío de correo se implementará en la siguiente etapa.");
        }
    }
}