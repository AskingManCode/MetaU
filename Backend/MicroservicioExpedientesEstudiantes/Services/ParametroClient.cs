namespace MicroservicioExpedientesEstudiantes.Services
{
    public class ParametroClient : IParametroClient
    {
        private const string DominioPorDefecto = "cuc.cr";

        public Task<string> ObtenerValor(string identificador) =>
            Task.FromResult(DominioPorDefecto);
    }
}
