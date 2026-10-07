using Microsoft.Data.SqlClient;

namespace MicroservicioPeriodos.Repository
{
    public class SqlConnectionFactory : ISqlConnectionFactory
    {
        private readonly string _connectionString;

        public SqlConnectionFactory(IConfiguration configuration)
        {
            _connectionString = configuration.GetConnectionString("OfertaAcademica")
                ?? throw new InvalidOperationException("No se encontro la cadena de conexion OfertaAcademica");
        }

        public SqlConnection CrearConexion()
        {
            return new SqlConnection(_connectionString);
        }
    }
}