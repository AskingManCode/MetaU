using MicroservicioCarreras.Entities;

namespace MicroservicioCarreras.Services
{
    public interface ICarreraService
    {
        Task<Carrera?> ObtenerPorIdAsync(string carreraCode);
        Task<IEnumerable<Carrera>> ObtenerTodosAsync();
        Task<IEnumerable<Carrera>> ObtenerPorInstitucionAsync(string institucionCode);
        Task CrearAsync(Carrera carrera);
        Task<bool> ActualizarAsync(string carreraCode, string nombre, Guid directorId);
        Task<bool> EliminarAsync(string carreraCode);
    }
}
