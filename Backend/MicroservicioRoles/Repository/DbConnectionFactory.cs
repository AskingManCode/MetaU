using Microsoft.Data.SqlClient;
using System.Data;

namespace MicroservicioRoles.Repository
{
    public class DbConnectionFactory : IDbConnectionFactory
    {
        private readonly IConfiguration _configuracion;

        public DbConnectionFactory(IConfiguration configuracion)
        { 
          _configuracion = configuracion;
        }

        public IDbConnection CrearConexion()
        {
            return new SqlConnection(_configuracion.GetConnectionString("Usuarios_DB"));
        }
    }
}
