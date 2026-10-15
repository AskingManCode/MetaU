using MicroservicioListaEstudiantes.Entities;

namespace MicroservicioListaEstudiantes.Services
{
    public interface IListadoEstudiantesService
    {
        Task<IEnumerable<EstudianteMatriculado>> ObtenerPorPeriodoAsync(string? periodo, Guid usuarioId, string token);
    }
}