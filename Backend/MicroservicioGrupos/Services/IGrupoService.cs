using MicroservicioGrupos.Entities;

namespace MicroservicioGrupos.Services
{
    public interface IGrupoService
    {
        Task CrearAsync(Grupo grupo);
        Task ModificarAsync(Grupo grupo);
        Task EliminarAsync(int idGrupo);
        Task<IEnumerable<Grupo>> ObtenerTodosAsync();
        Task<Grupo?> ObtenerPorIdAsync(int idGrupo);
    }
}