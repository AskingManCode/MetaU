using MicroservicioInstituciones.Entities;

namespace MicroservicioInstituciones.Services
{
    public interface IInstitucionService
    {
        Task<Institucion> ObtenerPorIdAsync(string institucionCode, string? authorization, string? usuarioId);
        Task<IEnumerable<Institucion>> ObtenerTodosAsync(string? authorization, string? usuarioId);
        Task<PaginaResultado<Institucion>> ObtenerPaginadoAsync(int pagina, string? authorization, string? usuarioId);
        Task<Institucion> CrearAsync(Institucion institucion, string? authorization, string? usuarioId);
        Task<Institucion> ActualizarAsync(string institucionCode, InstitucionUpdateRequest request, string? authorization, string? usuarioId);
        Task EliminarAsync(string institucionCode, string? authorization, string? usuarioId);
    }
}
