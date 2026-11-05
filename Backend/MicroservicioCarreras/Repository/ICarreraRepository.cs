using MicroservicioCarreras.Entities;

namespace MicroservicioCarreras.Repository
{
    public interface ICarreraRepository
    {
        Task<Carrera?> ObtenerPorIdAsync(string carreraCode);
        Task<IEnumerable<Carrera>> ObtenerTodosAsync();
        Task<IEnumerable<Carrera>> ObtenerPorInstitucionAsync(string institucionCode);
        Task<bool> ExisteAsync(string carreraCode);
        Task CrearAsync(Carrera carrera);
        Task<bool> ActualizarAsync(string carreraCode, string nombre, Guid directorId);
        Task<bool> EliminarAsync(string carreraCode);
    }
}
