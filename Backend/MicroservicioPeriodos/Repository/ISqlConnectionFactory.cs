using Microsoft.Data.SqlClient;

namespace MicroservicioPeriodos.Repository
{
    public interface ISqlConnectionFactory
    {
        SqlConnection CrearConexion();
    }
}