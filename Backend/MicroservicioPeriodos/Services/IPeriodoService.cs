using MicroservicioPeriodos.Entities;

namespace MicroservicioPeriodos.Services
{
    public interface IPeriodoService
    {
        Task<Periodo> CrearAsync(Periodo periodo);
        Task ModificarAsync(Periodo periodo);
        Task EliminarAsync(int periodoID);
        Task<IEnumerable<Periodo>> ObtenerTodosAsync();
        Task<Periodo?> ObtenerPorIdAsync(int periodoID);
    }
}