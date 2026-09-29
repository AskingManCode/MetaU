namespace MicroservicioExpedientesEstudiantes.Services
{
    public interface IParametroClient
    {
        Task<string> ObtenerValor(string identificador);
    }
}
