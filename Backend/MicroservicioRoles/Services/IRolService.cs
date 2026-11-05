using MicroservicioRoles.Entities;

namespace MicroservicioRoles.Services
{
    public interface IRolService
    {
        Task<IEnumerable<Rol>> ObtenerTodosAsync();
        Task<Rol> ObtenerPorIdAsync(string id);
        Task<Rol> CrearAsync(Rol rol);
        Task<(Rol Anterior, Rol Actual)> ActualizarAsync(string id, Rol rol);
        Task<Rol> EliminarAsync(string id);
        Task<IEnumerable<RolModulo>> ObtenerPermisosAsync(string id);
        Task<(IEnumerable<RolModulo> Anteriores, IEnumerable<RolModulo> Actuales)> ActualizarPermisosAsync(string id, List<RolModulo> cambios);
        Task<PaginaResultado<Rol>> ObtenerPaginadoAsync(int pagina, Guid usuarioId, string token);
    }
}