namespace MicroservicioNotas.Services
{
    public interface IParametroClient
    {
        Task<decimal> ObtenerValorNumerico(string identificador, ContextoUsuario contexto);
    }
}
