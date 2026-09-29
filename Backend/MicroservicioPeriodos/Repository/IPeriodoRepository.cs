using MicroservicioPeriodos.Entities;

namespace MicroservicioPeriodos.Repository
{
    public interface IPeriodoRepository
    {
        Task<Periodo> CrearAsync(Periodo periodo);
        Task ModificarAsync(Periodo periodo);
        Task EliminarAsync(int periodoID);
        Task<IEnumerable<Periodo>> ObtenerTodosAsync();
        Task<Periodo?> ObtenerPorIdAsync(int periodoID);
    }
}