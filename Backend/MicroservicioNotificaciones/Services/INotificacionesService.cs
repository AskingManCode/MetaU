using MicroservicioNotificaciones.Entities;

namespace MicroservicioNotificaciones.Services
{
    public interface INotificacionesService
    {
        Task<NotificarResponse> EnviarCorreoAsync(NotificarRequest request, HttpRequest httpRequest);
        Task<NotificarMultipleResponse> EnviarCorreosMultiplesAsync(NotificarMultipleRequest request, HttpRequest httpRequest);
        Task<IEnumerable<NotificacionHistorialResponse>> ObtenerHistorialAsync(HttpRequest httpRequest);
    }
}
