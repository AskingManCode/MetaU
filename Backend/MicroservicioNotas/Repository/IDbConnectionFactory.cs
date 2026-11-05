using System.Data;

namespace MicroservicioNotas.Repository
{
    public interface IDbConnectionFactory
    {
        IDbConnection CrearConexion();
    }
}
