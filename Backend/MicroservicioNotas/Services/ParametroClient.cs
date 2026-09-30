namespace MicroservicioNotas.Services
{
    public class ParametroClient : IParametroClient
    {
        private static readonly Dictionary<string, decimal> ValoresPorDefecto = new()
        {
            ["TOTRUBRO"] = 100m,
            ["NOTAMIN"] = 1m,
            ["NOTAMAX"] = 100m
        };

        public Task<decimal> ObtenerValorNumerico(string identificador) =>
            Task.FromResult(ValoresPorDefecto.GetValueOrDefault(identificador, 0m));
    }
}
