using Dapper;
using System.Data;
using MicroservicioDirecciones.Entities;

namespace MicroservicioDirecciones.Repository
{
    public class DireccionRepository : IDireccionRepository
    {
        private readonly IDBConnectionFactory _connectionFactory;

        public DireccionRepository(IDBConnectionFactory connectionFactory)
        {
            this._connectionFactory = connectionFactory;
        }

        public async Task<IEnumerable<ProvinciaResponse>> ObtenerProvinciasAsync()
        {
            using var connection = _connectionFactory.CreateConnection();

            return await connection.QueryAsync<ProvinciaResponse>(
                "dbo.usp_Provincias_ObtenerProvincias",
                commandType: CommandType.StoredProcedure
            );
        }

        public async Task<IEnumerable<CantonResponse>> ObtenerCantonesAsync(Guid ProvinciaID)
        {
            using var connection = _connectionFactory.CreateConnection();

            return await connection.QueryAsync<CantonResponse>(
                "dbo.usp_Cantones_ObtenerCantones",
                new
                {
                    ProvinciaID 
                },
                commandType: CommandType.StoredProcedure
            );
        }

        public async Task<IEnumerable<DistritoResponse>> ObtenerDistritosAsync(Guid ProvinciaID, Guid CantonID)
        {
            using var connection = _connectionFactory.CreateConnection();

            return await connection.QueryAsync<DistritoResponse>(
                "dbo.usp_Distritos_ObtenerDistritos",
                new
                {
                    ProvinciaID,
                    CantonID
                },
                commandType: CommandType.StoredProcedure
            );
        }
    }
}
