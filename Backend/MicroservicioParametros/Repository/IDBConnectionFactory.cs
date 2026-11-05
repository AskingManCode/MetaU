using System.Data;

namespace MicroservicioParametros.Repository
{
    public interface IDBConnectionFactory
    {
        IDbConnection CreateConnection();
    }
}