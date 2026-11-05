using System.Data;

namespace MicroservicioDirecciones.Repository
{
    public interface IDBConnectionFactory
    {
        IDbConnection CreateConnection();
    }
}