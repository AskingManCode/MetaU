using System.Data;
using Dapper;
using MicroservicioFacturacion.Entities;

namespace MicroservicioFacturacion.Repository
{
    public class FacturacionRepository : IFacturacionRepository
    {
        private readonly IDBConnectionFactory _connectionFactory;

        public FacturacionRepository(IDBConnectionFactory connectionFactory)
        {
            _connectionFactory = connectionFactory;
        }

        public async Task<Guid> CrearConDetallesAsync(
            string identificacionEstudiante,
            Guid matriculaId,
            Guid periodoId,
            decimal monto,
            IEnumerable<(string CursoCode, string Descripcion, decimal Monto)> detalles)
        {
            using var connection = _connectionFactory.CreateConnection();
            connection.Open();

            using var transaction = connection.BeginTransaction();

            try
            {
                // Crear encabezado (el SP ya no maneja su propia transacción)
                var facturaId = await connection.QuerySingleAsync<Guid>(
                    "dbo.usp_Facturas_Crear",
                    new
                    {
                        IdentificacionEstudiante = identificacionEstudiante,
                        MatriculaID = matriculaId,
                        PeriodoID = periodoId,
                        Monto = monto
                    },
                    transaction,
                    commandType: CommandType.StoredProcedure);

                // Agregar detalles
                foreach (var detalle in detalles)
                {
                    await connection.ExecuteAsync(
                        "dbo.usp_Facturas_AgregarDetalle",
                        new
                        {
                            FacturaID = facturaId,
                            CursoCode = detalle.CursoCode,
                            Descripcion = detalle.Descripcion,
                            Monto = detalle.Monto
                        },
                        transaction,
                        commandType: CommandType.StoredProcedure);
                }

                transaction.Commit();
                return facturaId;
            }
            catch
            {
                try { transaction.Rollback(); } catch { /* ya estaba rolled back */ }
                throw;
            }
        }

        public async Task<bool> AnularAsync(Guid facturaId)
        {
            using var connection = _connectionFactory.CreateConnection();

            var rowsAffected = await connection.ExecuteAsync(
                "dbo.usp_Facturas_Anular",
                new { FacturaID = facturaId },
                commandType: CommandType.StoredProcedure);

            return rowsAffected > 0;
        }

        public async Task<FacturaResponse?> ObtenerPorIdAsync(Guid facturaId)
        {
            using var connection = _connectionFactory.CreateConnection();

            var rows = (await connection.QueryAsync(
                "dbo.usp_Facturas_ObtenerPorID",
                new { FacturaID = facturaId },
                commandType: CommandType.StoredProcedure)).ToList();

            if (!rows.Any())
                return null;

            return MapearFactura(rows);
        }

        public async Task<IEnumerable<FacturaResponse>> ObtenerPorPeriodoAsync(Guid periodoId)
        {
            using var connection = _connectionFactory.CreateConnection();

            var rows = (await connection.QueryAsync(
                "dbo.usp_Facturas_ObtenerPorPeriodo",
                new { PeriodoID = periodoId },
                commandType: CommandType.StoredProcedure)).ToList();

            if (!rows.Any())
                return Enumerable.Empty<FacturaResponse>();

            var facturas = rows
                .GroupBy(r => (Guid)r.FacturaID)
                .Select(grupo => MapearFactura(grupo.ToList()))
                .ToList();

            return facturas;
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
