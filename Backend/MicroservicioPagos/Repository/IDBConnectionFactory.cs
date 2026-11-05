using System.Data;

namespace MicroservicioPagos.Repository
{
    public interface IDBConnectionFactory
    {
        IDbConnection CreateConnection();
    }
}
