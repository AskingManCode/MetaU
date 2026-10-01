namespace MicroservicioProfesores.Services
{
    public interface IParametroServiceClient
    {
        Task<string?> ObtenerValorAsync(string identificador, string token);
    }
}