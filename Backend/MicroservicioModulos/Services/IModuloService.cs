using MicroservicioModulos.Entities;

namespace MicroservicioModulos.Services
{
    public interface IModuloService
    {
        Task<IEnumerable<Modulos>> ObtenerTodosAsync();
        Task<Modulos> ObtenerPorIdAsync(string id);
        Task<Modulos> CrearAsync(Modulos modulo);
        Task<(Modulos Anterior, Modulos Actual)> ActualizarAsync(string id, Modulos modulo);
        Task<Modulos> EliminarAsync(string id);
        Task<PaginaResultado<Modulos>> ObtenerPaginadoAsync(int pagina, Guid usuarioId, string token);
    }
}