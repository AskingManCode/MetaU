namespace MicroservicioUsuarios.Services.Clients
{
    public interface IParametroServiceClient
    {
        Task<string?> ObtenerValorAsync(string parametroCode, Guid usuarioId, string token);
    }
}