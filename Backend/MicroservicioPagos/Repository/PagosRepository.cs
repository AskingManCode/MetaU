using System.Data;
using Dapper;
using MicroservicioPagos.Entities;

namespace MicroservicioPagos.Repository
{
    public class PagosRepository : IPagosRepository
    {
        private readonly IDBConnectionFactory _connectionFactory;

        public PagosRepository(IDBConnectionFactory connectionFactory)
        {
            _connectionFactory = connectionFactory;
        }

        public async Task<Guid> CrearAsync(Guid facturaId)
        {
            using var connection = _connectionFactory.CreateConnection();

            return await connection.QuerySingleAsync<Guid>(
                "dbo.usp_Pagos_Crear",
                new { FacturaID = facturaId },
                commandType: CommandType.StoredProcedure);
        }

        public async Task<PagoResponse?> ObtenerPorIdAsync(Guid pagoId)
        {
            using var connection = _connectionFactory.CreateConnection();

            var pago = await connection.QuerySingleOrDefaultAsync<PagoResponse>(
                "dbo.usp_Pagos_ObtenerPorID",
                new { PagoID = pagoId },
                commandType: CommandType.StoredProcedure);

            if (pago is null)
                return null;

            pago.Factura = await ObtenerFacturaAsync(connection, pago.FacturaID);
            return pago;
        }

        public async Task<IEnumerable<PagoResponse>> ObtenerPorPeriodoAsync(Guid periodoId)
        {
            using var connection = _connectionFactory.CreateConnection();

            var pagos = (await connection.QueryAsync<PagoResponse>(
                "dbo.usp_Pagos_ObtenerPorPeriodo",
                new { PeriodoID = periodoId },
                commandType: CommandType.StoredProcedure)).ToList();

            foreach (var pago in pagos)
            {
                pago.Factura = await ObtenerFacturaAsync(connection, pago.FacturaID);
            }

            return pagos;
        }

        public async Task<PagoResponse?> ReversarAsync(Guid pagoId)
        {
            using var connection = _connectionFactory.CreateConnection();

            var pago = await connection.QuerySingleOrDefaultAsync<PagoResponse>(
                "dbo.usp_Pagos_Reversar",
                new { PagoID = pagoId },
                commandType: CommandType.StoredProcedure);

            if (pago is null)
                return null;

            pago.Factura = await ObtenerFacturaAsync(connection, pago.FacturaID);
            return pago;
        }

        private async Task<FacturaResponse> ObtenerFacturaAsync(IDbConnection connection, Guid facturaId)
        {
            var rows = (await connection.QueryAsync(
                "dbo.usp_Facturas_ObtenerPorID",
                new { FacturaID = facturaId },
                commandType: CommandType.StoredProcedure)).ToList();

            if (!rows.Any())
                throw new InvalidOperationException("No se pudo recuperar la factura asociada al pago.");

            return MapearFactura(rows);
        }

        private static FacturaResponse MapearFactura(List<dynamic> rows)
        {
            var primera = rows.First();

            var factura = new FacturaResponse
            {
                FacturaID = primera.FacturaID,
                IdentificacionEstudiante = primera.IdentificacionEstudiante,
                MatriculaID = primera.MatriculaID,
                PeriodoID = primera.PeriodoID,
                Estado = primera.Estado,
                FechaEmision = primera.FechaEmision,
                FechaAnulacion = primera.FechaAnulacion,
                Subtotal = primera.Subtotal,
                PorcentajeImpuesto = primera.PorcentajeImpuesto,
                Impuesto = primera.Impuesto,
                Total = primera.Total,
                Detalles = new List<DetalleFacturaResponse>()
            };

            foreach (var row in rows)
            {
                if (row.DetalleFacturaID != null)
                {
                    factura.Detalles.Add(new DetalleFacturaResponse
                    {
                        DetalleFacturaID = row.DetalleFacturaID,
                        Descripcion = row.Descripcion,
                        CursoCode = row.CursoCode,
                        Monto = row.MontoDetalle
                    });
                }
            }

            return factura;
        }
    }
}
