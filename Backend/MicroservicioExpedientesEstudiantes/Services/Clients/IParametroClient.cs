namespace MicroservicioExpedientesEstudiantes.Services
{
    public interface IParametroClient
    {
        Task<string> ObtenerValor(string identificador, ContextoUsuario contexto);
        Task<string?> ObtenerValorPaginacion(string identificador, ContextoUsuario contexto);
    }
}
