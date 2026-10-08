using System.Data;
using Microsoft.Data.SqlClient;

namespace MicroservicioFacturacion.Repository
{
    public class DBConnectionFactory: IDBConnectionFactory
    {
        private readonly IConfiguration _configuration;

        public DBConnectionFactory(IConfiguration configuration)
        {
            this._configuration = configuration;
        }

        public IDbConnection CreateConnection()
        {
            return new SqlConnection(this._configuration.GetConnectionString("DefaultConnection"));
        }
    }
}
