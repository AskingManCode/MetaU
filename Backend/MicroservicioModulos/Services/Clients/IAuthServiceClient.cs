namespace MicroservicioModulos.Services.Clients
{
    public interface IAuthServiceClient
    {
        Task<bool> ValidarAsync(string token);
    }
}
