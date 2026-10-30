
using MicroservicioGrupos.Entities;

namespace MicroservicioGrupos.Services
{
    public interface IGrupoService
    {
        Task CrearAsync(Grupo grupo);
        Task<Grupo> ModificarAsync(Grupo grupo);
        Task<Grupo> EliminarAsync(string grupoCode);
        Task<IEnumerable<Grupo>> ObtenerTodosAsync();
        Task<PaginaResultado<Grupo>> ObtenerPaginadoAsync(int pagina, Guid usuario, string token);
        Task<Grupo> ObtenerPorIdAsync(string grupoCode);
    }
}
