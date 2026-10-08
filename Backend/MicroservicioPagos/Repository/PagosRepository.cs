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

        public async Task<Pago?> ObtenerPorIDAsync(Guid pagoId)
        {
            using var connection = _connectionFactory.CreateConnection();
            return await connection.QuerySingleOrDefaultAsync<Pago>(
                "dbo.usp_Pagos_ObtenerPorID",
                new { PagoID = pagoId },
                commandType: CommandType.StoredProcedure);
        }

        public async Task<IEnumerable<Pago>> ObtenerPorPeriodoAsync(Guid periodoId)
        {
            using var connection = _connectionFactory.CreateConnection();
            return await connection.QueryAsync<Pago>(
                "dbo.usp_Pagos_ObtenerPorPeriodo",
                new { PeriodoID = periodoId },
                commandType: CommandType.StoredProcedure);
        }

        public async Task<Pago?> ReversarAsync(Guid pagoId)
        {
            using var connection = _connectionFactory.CreateConnection();
            return await connection.QuerySingleOrDefaultAsync<Pago>(
                "dbo.usp_Pagos_Reversar",
                new { PagoID = pagoId },
                commandType: CommandType.StoredProcedure);
        }
    }
}
