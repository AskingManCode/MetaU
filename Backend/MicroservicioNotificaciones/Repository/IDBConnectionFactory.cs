using System.Data;

namespace MicroservicioNotificaciones.Repository
{
    public interface IDBConnectionFactory
    {
        IDbConnection CreateConnection();
    }
}