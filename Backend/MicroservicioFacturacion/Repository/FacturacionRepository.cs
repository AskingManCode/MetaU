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

        public async Task<Guid> CrearAsync(string identificacionEstudiante, Guid matriculaId, Guid periodoId, decimal monto)
        {
            using var connection = _connectionFactory.CreateConnection();
            return await connection.QuerySingleAsync<Guid>(
                "dbo.usp_Facturas_Crear",
                new
                {
                    IdentificacionEstudiante = identificacionEstudiante,
                    MatriculaID = matriculaId,
                    PeriodoID = periodoId,
                    Monto = monto
                },
                commandType: CommandType.StoredProcedure);
        }

        public async Task<Factura?> ObtenerPorIdAsync(Guid facturaId)
        {
            using var connection = _connectionFactory.CreateConnection();
            return await connection.QuerySingleOrDefaultAsync<Factura>(
                "dbo.usp_Facturas_ObtenerPorID",
                new { FacturaID = facturaId },
                commandType: CommandType.StoredProcedure);
        }

        public async Task<IEnumerable<Factura>> ObtenerPorPeriodoAsync(Guid periodoId)
        {
            using var connection = _connectionFactory.CreateConnection();
            return await connection.QueryAsync<Factura>(
                "dbo.usp_Facturas_ObtenerPorPeriodo",
                new { PeriodoID = periodoId },
                commandType: CommandType.StoredProcedure);
        }

        public async Task<bool> AnularAsync(Guid facturaId)
        {
            using var connection = _connectionFactory.CreateConnection();
            return await connection.ExecuteScalarAsync<bool>(
                "dbo.usp_Facturas_Anular",
                new { FacturaID = facturaId },
                commandType: CommandType.StoredProcedure);
        }

    }
}
