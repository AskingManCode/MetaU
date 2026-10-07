using Microsoft.Data.SqlClient;
using System.Data;

namespace MicroservicioModulos.Repository
{
    public class DbConnectionFactory : IDbConnectionFactory
    {
        private readonly IConfiguration _configuration;

        public DbConnectionFactory(IConfiguration configuration)
        { 
             _configuration = configuration;
        }

        public IDbConnection CrearConexion()
        {
            return new SqlConnection(_configuration.GetConnectionString("UsuariosDB"));
        }
    }
}
