using System.Data;
using Microsoft.Data.SqlClient;

namespace MicroservicioPreMatriculas.Repository
{
    public class DbConnectionFactory : IDbConnectionFactory
    {
        private readonly string _connectionString;

        public DbConnectionFactory(IConfiguration configuration)
        {
            _connectionString = configuration.GetConnectionString("Matriculas")
                ?? throw new InvalidOperationException("No se encontro la cadena de conexion Matriculas");
        }

        public IDbConnection CrearConexion() => new SqlConnection(_connectionString);
    }
}
