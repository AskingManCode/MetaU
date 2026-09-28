using MicroservicioModulos.Entities;

namespace MicroservicioModulos.Services
{
    public interface IModuloService
    {
        Task<IEnumerable<Modulos>> ObtenerTodosAsync();
        Task<Modulos?> ObtenerPorIdAsync(string id);
        Task<int> CrearAsync(Modulos modulos);
        Task<int> ActualizarAsync(Modulos modulos);
        Task<int> EliminarAsync(string id);
    }
}
