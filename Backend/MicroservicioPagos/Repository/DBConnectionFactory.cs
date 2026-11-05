using System.Data;
using Microsoft.Data.SqlClient;

namespace MicroservicioPagos.Repository
{
    public class DBConnectionFactory : IDBConnectionFactory
    {
        private readonly IConfiguration _configuration;

        public DBConnectionFactory(IConfiguration configuration)
        {
            _configuration = configuration;
        }

        public IDbConnection CreateConnection()
        {
            var connectionString = _configuration.GetConnectionString("DefaultConnection")
                ?? throw new InvalidOperationException("No se configuró la cadena DefaultConnection.");

            return new SqlConnection(connectionString);
        }
    }
}
