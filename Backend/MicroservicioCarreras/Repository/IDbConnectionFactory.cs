using System.Data;

namespace MicroservicioCarreras.Repository
{
    public interface IDbConnectionFactory
    {
        IDbConnection CrearConexion();
    }
}
