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
                "MetaU_DB_User.usp_Parametros_Crear",
                new
                {
                    request.ParametroCode,
                    request.Valor
                },
                commandType: CommandType.StoredProcedure
            );
        }

        public async Task<ParametroResponse?> ObtenerPorIDAsync(string parametroCode)
        {
            using var connection = _connectionFactory.CreateConnection();

            return await connection.QuerySingleOrDefaultAsync<ParametroResponse>(
                "MetaU_DB_User.usp_Parametros_ObtenerPorID",
                new 
                { 
                    ParametroCode = parametroCode 
                },
                commandType: CommandType.StoredProcedure
            );
        }

        public async Task<ParametroResponse?> ModificarAsync(string parametroCode, ParametroRequest request)
        {
            using var connection = _connectionFactory.CreateConnection();

            return await connection.QuerySingleOrDefaultAsync<ParametroResponse>(
                "MetaU_DB_User.usp_Parametros_Modificar",
                new
                {
                    ParametroCode = parametroCode,
                    request.Valor
                },
                commandType: CommandType.StoredProcedure
            );
        }

        public async Task<IEnumerable<ParametroResponse>> ObtenerTodosAsync()
        {
            using var connection = _connectionFactory.CreateConnection();

            return await connection.QueryAsync<ParametroResponse>(
                "MetaU_DB_User.usp_Parametros_ObtenerTodos",
                commandType: CommandType.StoredProcedure
            );
        }

        public async Task<ParametroResponse?> EliminarAsync(string parametroCode, bool eliminacionFisica)
        {
            using var connection = _connectionFactory.CreateConnection();

            return await connection.QuerySingleOrDefaultAsync<ParametroResponse>(
                "MetaU_DB_User.usp_Parametros_Eliminar",
                new
                {
                    ParametroCode = parametroCode,
                    EliminacionFisica = eliminacionFisica
                },
                commandType: CommandType.StoredProcedure
            );
        }
    }
}