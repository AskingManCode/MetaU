using System.Net;
using System.Net.Http.Headers;
using System.Net.Http.Json;

namespace MicroservicioPreMatriculas.Services
{
    public class ParametroClient : IParametroClient
    {
        private readonly HttpClient _http;

        public ParametroClient(HttpClient http)
        {
            _http = http;
        }

        public async Task<string?> ObtenerValorAsync(string identificador, ContextoUsuario contexto)
        {
            using var request = new HttpRequestMessage(
                HttpMethod.Get, $"api/parametro/{Uri.EscapeDataString(identificador)}");
            request.Headers.Authorization = new AuthenticationHeaderValue("Bearer", contexto.Token);
            request.Headers.Add("UsuarioGUID", contexto.UsuarioId.ToString());

            using var response = await _http.SendAsync(request);
            if (response.StatusCode == HttpStatusCode.NotFound) return null;
            response.EnsureSuccessStatusCode();

            var parametro = await response.Content.ReadFromJsonAsync<ParametroResponse>();
            return parametro is { Estado: true } && !string.IsNullOrWhiteSpace(parametro.Valor)
                ? parametro.Valor
                : null;
        }

        private class ParametroResponse
        {
            public string Valor { get; set; } = string.Empty;
            public bool Estado { get; set; }
        }
    }
}
