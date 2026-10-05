using Microsoft.Data.SqlClient;

namespace MicroservicioCursos.Repository
{
    public interface ISqlConnectionFactory
    {
        SqlConnection CrearConexion();
    }
}