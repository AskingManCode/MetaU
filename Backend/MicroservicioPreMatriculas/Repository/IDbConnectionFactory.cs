using System.Data;

namespace MicroservicioPreMatriculas.Repository
{
    public interface IDbConnectionFactory
    {
        IDbConnection CrearConexion();
    }
}
