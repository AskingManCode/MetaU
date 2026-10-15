namespace MicroservicioListaEstudiantes.Services.Clients
{
    public interface IAuthServiceClient
    {
        Task<bool> ValidarAsync(string token);
    }
}