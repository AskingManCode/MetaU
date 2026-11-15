using MicroservicioListaEstudiantes.Entities;

namespace MicroservicioListaEstudiantes.Services
{
    public interface IListadoEstudiantesService
    {
        Task<IEnumerable<EstudianteMatriculado>> ObtenerPorPeriodoAsync(
            string? periodo, string? carrera, string? curso, string? grupo,
            string? ordenarPor, string? direccion, Guid usuarioId, string token);

        Task<PaginaEstudiantes> ObtenerPaginadoAsync(
            string? periodo, string? carrera, string? curso, string? grupo,
            string? ordenarPor, string? direccion, int pagina, Guid usuarioId, string token);
    }
}