using System.Data;

namespace MicroservicioMatriculas.Repository
{
    public interface IDbConnectionFactory
    {
        IDbConnection CrearConexion();
    }
}
