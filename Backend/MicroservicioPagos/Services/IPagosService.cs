using MicroservicioPagos.Entities;

namespace MicroservicioPagos.Services
{
    public interface IPagosService
    {
        Task<PagoResponse> CrearAsync(Guid facturaId, HttpRequest httpRequest);
        Task<PagoResponse> ReversarAsync(Guid pagoId, HttpRequest httpRequest);
        Task<PagoResponse?> ObtenerPorIdAsync(Guid pagoId, HttpRequest httpRequest);
        Task<IEnumerable<PagoResponse>> ObtenerPorPeriodoAsync(Guid periodoId, HttpRequest httpRequest);
    }
}
