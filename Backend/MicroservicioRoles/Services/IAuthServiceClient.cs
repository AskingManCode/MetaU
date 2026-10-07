namespace MicroservicioRoles.Services
{
    public interface IAuthServiceClient
    {
        Task<bool> ValidarAsync(string token);
    }
}
