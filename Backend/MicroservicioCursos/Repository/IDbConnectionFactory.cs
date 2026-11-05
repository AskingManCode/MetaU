using System.Data;

namespace MicroservicioCursos.Repository
{
    public interface IDbConnectionFactory
    {
        IDbConnection CrearConexion();
    }
}
