using MicroservicioPagos.Entities;

namespace MicroservicioPagos.Repository
{
    public interface IPagosRepository
    {
        Task<Guid> CrearAsync(Guid facturaId);
        Task<PagoResponse?> ObtenerPorIdAsync(Guid pagoId);
        Task<IEnumerable<PagoResponse>> ObtenerPorPeriodoAsync(Guid periodoId);
        Task<PagoResponse?> ReversarAsync(Guid pagoId);
    }
}
