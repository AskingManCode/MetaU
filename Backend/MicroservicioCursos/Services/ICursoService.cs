using MicroservicioCursos.Entities;

namespace MicroservicioCursos.Services
{
    public interface ICursoService
    {
        Task CrearAsync(Curso curso);
        Task ModificarAsync(Curso curso);
        Task EliminarAsync(string cursoCode);
        Task<IEnumerable<Curso>> ObtenerTodosAsync();
        Task<Curso?> ObtenerPorIdAsync(string cursoCode);
        Task<IEnumerable<Curso>> ObtenerPorCarreraAsync(string carreraCode);
    }
}