using System.Net;
using System.Net.Http.Headers;
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

        public async Task<string> ObtenerValor(string identificador, ContextoUsuario contexto)
        {
            try
            {
                using var request = new HttpRequestMessage(
                    HttpMethod.Get, $"api/parametro/{Uri.EscapeDataString(identificador)}");
                request.Headers.Authorization = new AuthenticationHeaderValue("Bearer", contexto.Token);
                request.Headers.Add("UsuarioGUID", contexto.UsuarioId.ToString());

                using var response = await _http.SendAsync(request);
                if (response.StatusCode == HttpStatusCode.NotFound) return DominioPorDefecto;
                response.EnsureSuccessStatusCode();

                var parametro = await response.Content.ReadFromJsonAsync<ParametroResponse>();

                return parametro is { Estado: true } && !string.IsNullOrWhiteSpace(parametro.Valor)
                    ? parametro.Valor
                    : DominioPorDefecto;
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
