using System.Data;

namespace MicroservicioModulos.Repository
{
    public interface IDbConnectionFactory
    {
        IDbConnection CrearConexion();
    }
}
