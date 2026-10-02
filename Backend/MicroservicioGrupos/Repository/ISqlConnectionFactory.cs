using Microsoft.Data.SqlClient;

namespace MicroservicioGrupos.Repository
{
    public interface ISqlConnectionFactory
    {
        SqlConnection CrearConexion();
    }
}