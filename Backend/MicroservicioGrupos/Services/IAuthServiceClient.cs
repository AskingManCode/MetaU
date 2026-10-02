namespace MicroservicioGrupos.Services
{
    public interface IAuthServiceClient
    {
        Task<bool> ValidarTokenAsync(string token);
    }
}