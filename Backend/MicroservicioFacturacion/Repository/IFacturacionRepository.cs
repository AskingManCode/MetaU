using MicroservicioFacturacion.Entities;

namespace MicroservicioFacturacion.Repository
{
    public interface IFacturacionRepository
    {
        Task<Guid> CrearAsync(Guid estudianteId, Guid matriculaId, Guid periodoId, decimal monto);
        Task AgregarDetalleAsync(Guid facturaId, string cursoCode, string descripcion, decimal monto);
        Task<bool> AnularAsync(Guid facturaId);
        Task<FacturaResponse?> ObtenerPorIdAsync(Guid facturaId);
        Task<IEnumerable<FacturaResponse>> ObtenerPorPeriodoAsync(Guid periodoId);
    }
}