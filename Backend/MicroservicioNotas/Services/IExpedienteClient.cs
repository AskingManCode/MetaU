namespace MicroservicioNotas.Services
{
    public interface IExpedienteClient
    {
        Task<Guid?> ObtenerEstudianteID(string identificacion, ContextoUsuario contexto);
    }
}
