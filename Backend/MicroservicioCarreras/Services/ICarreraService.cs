using MicroservicioCarreras.Entities;

namespace MicroservicioCarreras.Services
{
    public interface ICarreraService
    {
        Task<Carrera> ObtenerPorIdAsync(string carreraCode, string? authorization, string? usuarioId);
        Task<IEnumerable<Carrera>> ObtenerTodosAsync(string? authorization, string? usuarioId);
        Task<PaginaResultado<Carrera>> ObtenerPaginadoAsync(int pagina, string? authorization, string? usuarioId);
        Task<IEnumerable<Carrera>> ObtenerPorInstitucionAsync(string institucionCode, string? authorization, string? usuarioId);
        Task<PaginaResultado<Carrera>> ObtenerPorInstitucionPaginadoAsync(string institucionCode, int pagina, string? authorization, string? usuarioId);
        Task<Carrera> CrearAsync(Carrera carrera, string? authorization, string? usuarioId);
        Task<Carrera> ActualizarAsync(string carreraCode, CarreraUpdateRequest request, string? authorization, string? usuarioId);
        Task EliminarAsync(string carreraCode, string? authorization, string? usuarioId);
    }
}
