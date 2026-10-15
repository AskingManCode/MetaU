using System.Data;

namespace MicroservicioExpedientesEstudiantes.Repository
{
    public interface IDbConnectionFactory
    {
        IDbConnection CrearConexion();
    }
}
