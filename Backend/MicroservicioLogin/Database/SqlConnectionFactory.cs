using System.Data;
using Microsoft.Data.SqlClient;

namespace MicroservicioLogin.Database
{
    public class SqlConnectionFactory : IDbConnectionFactory
    {
        private readonly string _connectionString;

        public SqlConnectionFactory(IConfiguration configuracion)
        {
            _connectionString = configuracion.GetConnectionString("UsuariosDb")
                ?? throw new InvalidOperationException("Falta ConnectionStrings:UsuariosDb en appsettings.json");
        }

        public IDbConnection CrearConexion() => new SqlConnection(_connectionString);
    }
}
