using MicroservicioNotificaciones.Entities;

namespace MicroservicioNotificaciones.Repository
{
    public interface INotificacionesRepository
    {
        Task<Notificacion> CrearAsync(
            Guid usuarioId,
            string emailDestino,
            string parametrosJson);

        Task<Notificacion?> ActualizarEstadoAsync(
            long notificacionId,
            string estado,
            string? mensajeError = null,
            DateTime? fechaEnvio = null);
    }
}