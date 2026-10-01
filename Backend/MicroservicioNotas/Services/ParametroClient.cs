using System.Globalization;
using System.Net;
using System.Net.Http.Json;

namespace MicroservicioNotas.Services
{
    public class ParametroClient : IParametroClient
    {
        private readonly HttpClient _http;

        private static readonly Dictionary<string, decimal> ValoresPorDefecto = new()
        {
            ["TOTRUBRO"] = 100m,
            ["NOTAMIN"] = 1m,
            ["NOTAMAX"] = 100m
        };

        public ParametroClient(HttpClient http)
        {
            _http = http;
        }

        public async Task<decimal> ObtenerValorNumerico(string identificador)
        {
            try
            {
                var response = await _http.GetAsync($"parametro/{identificador}");
                if (response.StatusCode == HttpStatusCode.NotFound)
                    return ValoresPorDefecto.GetValueOrDefault(identificador, 0m);

                response.EnsureSuccessStatusCode();
                var parametro = await response.Content.ReadFromJsonAsync<ParametroResponse>();

                return decimal.TryParse(parametro?.Valor, NumberStyles.Number, CultureInfo.InvariantCulture, out var valor)
                    ? valor
                    : ValoresPorDefecto.GetValueOrDefault(identificador, 0m);
            }
            catch (HttpRequestException)
            {
                return ValoresPorDefecto.GetValueOrDefault(identificador, 0m);
            }
        }

        private class ParametroResponse
        {
            public string ParametroCode { get; set; } = string.Empty;
            public string Valor { get; set; } = string.Empty;
            public bool Estado { get; set; }
        }
    }
}
