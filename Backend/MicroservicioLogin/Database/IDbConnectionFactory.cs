using System.Data;

namespace MicroservicioLogin.Database
{
    public interface IDbConnectionFactory
    {
        IDbConnection CrearConexion();
    }
}
