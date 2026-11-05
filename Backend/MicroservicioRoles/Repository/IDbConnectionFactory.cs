using System.Data;

namespace MicroservicioRoles.Repository
{
    public interface IDbConnectionFactory
    {
        IDbConnection CrearConexion();
	}
}
