using MicroservicioGrupos.Entities;

namespace MicroservicioGrupos.Repository
{
    public interface IGrupoRepository
    {
        Task CrearAsync(Grupo grupo);
        Task ModificarAsync(Grupo grupo);
        Task EliminarAsync(string grupoCode);
        Task<IEnumerable<Grupo>> ObtenerTodosAsync();
        Task<Grupo?> ObtenerPorIdAsync(string grupoCode);
    }
}