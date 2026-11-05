using System.Data;

namespace MicroservicioInstituciones.Repository
{
    public interface IDbConnectionFactory
    {
        IDbConnection CrearConexion();
    }
}
