using MicroservicioRoles.Entities;

namespace MicroservicioRoles.Services
{
    public interface IRolService
    {
        Task<IEnumerable<Rol>> ObtenerTodosAsync();
        Task<Rol?> ObtenerPorIdAsync(string id);
        Task<int> CrearAsync(Rol rol);
        Task<int> ActualizarAsync(Rol rol);
        Task<int> EliminarAsync(string id);
    }
}
