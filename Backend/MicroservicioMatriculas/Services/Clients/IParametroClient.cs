namespace MicroservicioMatriculas.Services
{
    public interface IParametroClient
    {
        Task<string?> ObtenerValorAsync(string identificador, ContextoUsuario contexto);
    }
}
