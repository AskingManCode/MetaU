using MicroservicioPeriodos.Entities;

namespace MicroservicioPeriodos.Services
{
    public interface IPeriodoService
    {
        Task<Periodo> CrearAsync(Periodo periodo);
        Task<Periodo> ModificarAsync(Periodo periodo);
        Task<Periodo> EliminarAsync(Guid periodoID);
        Task<IEnumerable<Periodo>> ObtenerTodosAsync();
        Task<Periodo> ObtenerPorIdAsync(Guid periodoID);
    }
}