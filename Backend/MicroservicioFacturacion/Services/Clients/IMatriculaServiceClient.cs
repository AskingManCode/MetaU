using MicroservicioFacturacion.Entities.DTOs;

namespace MicroservicioFacturacion.Services.Clients
{
    public interface IMatriculaServiceClient
    {
        Task<IReadOnlyList<MatriculaFacturacionResponse>> ObtenerPorEstudianteAsync(
            string identificacion, Guid usuarioId, string token);
    }
}
