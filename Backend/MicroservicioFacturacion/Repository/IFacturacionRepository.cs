using MicroservicioFacturacion.Entities;

namespace MicroservicioFacturacion.Repository
{
    public interface IFacturacionRepository
    {
        Task<Guid> CrearAsync(string identificacionEstudiante, Guid matriculaId, Guid periodoId, decimal monto);
        Task<Factura?> ObtenerPorIdAsync(Guid facturaId);
        Task<IEnumerable<Factura>> ObtenerPorPeriodoAsync(Guid periodoId);
        Task<bool> AnularAsync(Guid facturaId);
    }
}
