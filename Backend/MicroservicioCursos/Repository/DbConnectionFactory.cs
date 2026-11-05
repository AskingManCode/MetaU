using System.Data;
using Microsoft.Data.SqlClient;

namespace MicroservicioCursos.Repository
{
    public class DbConnectionFactory : IDbConnectionFactory
    {
        private readonly string _connectionString;

        public DbConnectionFactory(IConfiguration configuration)
        {
            _connectionString = configuration.GetConnectionString("OfertaAcademica")
                ?? throw new InvalidOperationException("No se encontro la cadena de conexion OfertaAcademica");
        }

        public IDbConnection CrearConexion() => new SqlConnection(_connectionString);
    }
}
