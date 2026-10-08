using MicroservicioPagos.Entities;

namespace MicroservicioPagos.Repository
{
    public interface IPagosRepository
    {
        Task<Guid> CrearAsync(Guid facturaId);
        Task<Pago?> ObtenerPorIDAsync(Guid pagoId);
        Task<IEnumerable<Pago>> ObtenerPorPeriodoAsync(Guid periodoId);
        Task<Pago?> ReversarAsync(Guid pagoId);
    }
}
