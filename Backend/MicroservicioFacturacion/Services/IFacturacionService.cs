using MicroservicioFacturacion.Entities;

namespace MicroservicioFacturacion.Services
{
    public interface IFacturacionService
    {
        Task<FacturaResponse> CrearAsync(FacturacionRequest request, Guid usuarioId, string token);
        Task<FacturaResponse> AnularAsync(Guid facturaId);
        Task<FacturaResponse?> ObtenerPorIdAsync(Guid facturaId);
        Task<IEnumerable<FacturaResponse>> ObtenerPorPeriodoAsync(Guid periodoId);
    }
}
