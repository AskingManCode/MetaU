using MicroservicioPagos.Entities.DTOs;

namespace MicroservicioPagos.Services
{
    public interface IPagosService
    {
        Task<PagoResponse> CrearAsync(PagoRequest request);
        Task<PagoResponse> ReversarAsync(Guid pagoId);
        Task<PagoResponse?> ObtenerPorIDAsync(Guid pagoId);
        Task<IEnumerable<PagoResponse>> ObtenerPorPeriodoAsync(Guid periodoId);
    }
}
