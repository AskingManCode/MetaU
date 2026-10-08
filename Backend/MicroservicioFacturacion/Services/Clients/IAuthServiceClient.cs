namespace MicroservicioFacturacion.Services.Clients
{
    public interface IAuthServiceClient
    {
        Task<bool> ValidarTokenAsync(string token);
    }
}