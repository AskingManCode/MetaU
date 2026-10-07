using MicroservicioNotificaciones.Entities;

namespace MicroservicioNotificaciones.Services
{
    public interface INotificacionesService
    {
        Task<NotificarResponse> EnviarCorreoAsync(NotificarRequest request);
    }
}