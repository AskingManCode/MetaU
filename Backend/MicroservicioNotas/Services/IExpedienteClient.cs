namespace MicroservicioNotas.Services
{
    public interface IExpedienteClient
    {
        Task<bool> Existe(string identificacion, ContextoUsuario contexto);
    }
}
