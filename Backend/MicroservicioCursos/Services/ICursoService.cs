using MicroservicioCursos.Entities;

namespace MicroservicioCursos.Services
{
    public interface ICursoService
    {
        Task<Curso> CrearAsync(CursoRequest request, string? authorization, string? usuarioId);
        Task<Curso> ModificarAsync(string cursoCode, CursoRequest request, string? authorization, string? usuarioId);
        Task<Curso> EliminarAsync(string cursoCode, string? authorization, string? usuarioId);
        Task<IEnumerable<Curso>> ObtenerTodosAsync(string? authorization, string? usuarioId);
        Task<PaginaResultado<Curso>> ObtenerPaginadoAsync(int pagina, string? authorization, string? usuarioId);
        Task<Curso> ObtenerPorIdAsync(string cursoCode, string? authorization, string? usuarioId);
        Task<IEnumerable<Curso>> ObtenerPorCarreraAsync(string carreraCode, string? authorization, string? usuarioId);
        Task<PaginaResultado<Curso>> ObtenerPorCarreraPaginadoAsync(string carreraCode, int pagina, string? authorization, string? usuarioId);
    }
}