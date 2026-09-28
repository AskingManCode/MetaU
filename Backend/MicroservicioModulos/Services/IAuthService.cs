namespace MicroservicioModulos.Services
{
    public interface IAuthService
    {
        Task<bool> ValidarAsync(string token);
    }
}
