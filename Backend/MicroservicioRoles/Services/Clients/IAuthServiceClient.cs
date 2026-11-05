namespace MicroservicioRoles.Services.Clients
{
    public interface IAuthServiceClient
    {
        Task<bool> ValidarAsync(string token);
    }
}
