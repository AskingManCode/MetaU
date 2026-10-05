using MicroservicioListaEstudiantes.Entities;

namespace MicroservicioListaEstudiantes.Services
{
    public interface IListadoEstudiantesService
    {
        Task<IEnumerable<EstudianteMatriculado>> ObtenerPorPeriodoAsync(Guid periodo, Guid usuarioId, string token);
    }
}