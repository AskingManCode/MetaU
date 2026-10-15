using MicroservicioFacturacion.Entities;

namespace MicroservicioFacturacion.Repository
{
    public interface IFacturacionRepository
    {
        Task<Guid> CrearConDetallesAsync(string identificacionEstudiante, Guid matriculaId, Guid periodoId, decimal monto,
            IEnumerable<(string CursoCode, string Descripcion, decimal Monto)> detalles);

        Task<bool> AnularAsync(Guid facturaId);
        Task<FacturaResponse?> ObtenerPorIdAsync(Guid facturaId);
        Task<IEnumerable<FacturaResponse>> ObtenerPorPeriodoAsync(Guid periodoId);
    }
}