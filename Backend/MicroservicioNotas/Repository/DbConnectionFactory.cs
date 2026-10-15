using System.Data;
using Microsoft.Data.SqlClient;

namespace MicroservicioNotas.Repository
{
    public class DbConnectionFactory : IDbConnectionFactory
    {
        private readonly string _connectionString;

        public DbConnectionFactory(IConfiguration configuration)
        {
            _connectionString = configuration.GetConnectionString("NotasAcademicas")
                ?? throw new InvalidOperationException("No se encontro la cadena de conexion NotasAcademicas");
        }

        public IDbConnection CrearConexion() => new SqlConnection(_connectionString);
    }
}
