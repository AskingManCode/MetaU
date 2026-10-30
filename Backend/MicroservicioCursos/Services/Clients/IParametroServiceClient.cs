namespace MicroservicioCursos.Services
{
    public interface IParametroServiceClient
    {
        Task<string?> ObtenerValorAsync(string parametroCode, Guid usuarioId, string token);
    }
}
