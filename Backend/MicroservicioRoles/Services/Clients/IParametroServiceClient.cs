namespace MicroservicioRoles.Services.Clients
{
    public interface IParametroServiceClient
    {
        Task<string?> ObtenerValorAsync(string identificador, Guid usuario, string token);
    }
}