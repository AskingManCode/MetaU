using Dapper;
using MicroservicioNotificaciones.Entities;
using System.Data;

namespace MicroservicioNotificaciones.Repository
{
    public class NotificacionesRepository : INotificacionesRepository
    {
        private readonly IDBConnectionFactory _connectionFactory;

        public NotificacionesRepository(IDBConnectionFactory connectionFactory)
        {
            _connectionFactory = connectionFactory;
        }

        public async Task<Notificacion> CrearAsync(
            Guid usuarioId,
            string emailDestino,
            string parametrosJson)
        {
            using var connection = _connectionFactory.CreateConnection();

            return await connection.QuerySingleAsync<Notificacion>(
                "dbo.usp_Notificaciones_Crear",
                new
                {
                    UsuarioID = usuarioId,
                    EmailDestino = emailDestino,
                    PlantillaNotificacionCode = "CUSTOM",
                    ParametrosJson = parametrosJson,
                    EstadoNotificacion = "PENDIENTE"
                },
                commandType: CommandType.StoredProcedure
            );
        }

        public async Task<Notificacion?> ActualizarEstadoAsync(
            long notificacionId,
            string estado,
            string? mensajeError = null,
            DateTime? fechaEnvio = null)
        {
            using var connection = _connectionFactory.CreateConnection();

            return await connection.QuerySingleOrDefaultAsync<Notificacion>(
                "dbo.usp_Notificaciones_ActualizarEstado",
                new
                {
                    NotificacionID = notificacionId,
                    EstadoNotificacion = estado,
                    MensajeError = mensajeError,
                    FechaEnvio = fechaEnvio
                },
                commandType: CommandType.StoredProcedure
            );
        }
    }
}