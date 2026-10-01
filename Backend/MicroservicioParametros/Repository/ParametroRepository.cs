using Dapper;
using MicroservicioParametros.Entities;
using System.Data;

namespace MicroservicioParametros.Repository
{
    public class ParametroRepository : IParametroRepository
    {
        private readonly IDBConnectionFactory _connectionFactory;

        public ParametroRepository(IDBConnectionFactory connectionFactory)
        {
            _connectionFactory = connectionFactory;
        }

        public async Task<ParametroResponse> CrearAsync(ParametroRequest request)
        {
            using var connection = _connectionFactory.CreateConnection();

            return await connection.QuerySingleAsync<ParametroResponse>(
                "dbo.usp_Parametros_Crear",
                new
                {
                    request.ParametroCode,
                    request.Valor
                },
                commandType: CommandType.StoredProcedure
            );
        }
    }
}