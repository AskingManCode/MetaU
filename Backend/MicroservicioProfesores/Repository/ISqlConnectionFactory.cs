using Microsoft.Data.SqlClient;

namespace MicroservicioProfesores.Repository
{
    public interface ISqlConnectionFactory
    {
        SqlConnection CrearConexion();
    }
}