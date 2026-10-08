using System.Data;

namespace MicroservicioFacturacion.Repository
{
    public interface IDBConnectionFactory
    {
        IDbConnection CreateConnection();
    }
}