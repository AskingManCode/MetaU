using System.Net;
using System.Net.Http.Json;

namespace MicroservicioExpedientesEstudiantes.Services
{
    public class ParametroClient : IParametroClient
    {
        private readonly HttpClient _http;
        private const string DominioPorDefecto = "cuc.cr";

        public ParametroClient(HttpClient http)
        {
            _http = http;
        }

        public async Task<string> ObtenerValor(string identificador)
        {
            try
            {
                var response = await _http.GetAsync($"parametro/{identificador}");
                if (response.StatusCode == HttpStatusCode.NotFound) return DominioPorDefecto;
                response.EnsureSuccessStatusCode();

                var parametro = await response.Content.ReadFromJsonAsync<ParametroResponse>();
                return string.IsNullOrWhiteSpace(parametro?.Valor) ? DominioPorDefecto : parametro.Valor;
            }
            catch (HttpRequestException)
            {
                return DominioPorDefecto;
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
