using MicroservicioGrupos.Entities;

namespace MicroservicioGrupos.Services
{
    public interface IGrupoService
    {
        Task CrearAsync(Grupo grupo);
        Task ModificarAsync(Grupo grupo);
        Task EliminarAsync(string grupoCode);
        Task<IEnumerable<Grupo>> ObtenerTodosAsync();
        Task<Grupo?> ObtenerPorIdAsync(string grupoCode);
    }
}