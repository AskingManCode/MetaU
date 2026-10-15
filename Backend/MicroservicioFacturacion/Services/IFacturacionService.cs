using MicroservicioFacturacion.Entities;

namespace MicroservicioFacturacion.Services
{
    public interface IFacturacionService
    {
        Task<FacturaResponse> CrearAsync(FacturacionRequest request, HttpRequest httpRequest);
        Task<FacturaResponse> AnularAsync(Guid facturaId, HttpRequest httpRequest);
        Task<FacturaResponse?> ObtenerPorIdAsync(Guid facturaId, HttpRequest httpRequest);
        Task<IEnumerable<FacturaResponse>> ObtenerPorPeriodoAsync(Guid periodoId, HttpRequest httpRequest);
    }
}