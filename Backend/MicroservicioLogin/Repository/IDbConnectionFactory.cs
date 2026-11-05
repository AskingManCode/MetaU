using System.Data;

namespace MicroservicioLogin.Repository
{
    public interface IDbConnectionFactory
    {
        IDbConnection CrearConexion();
    }
}
