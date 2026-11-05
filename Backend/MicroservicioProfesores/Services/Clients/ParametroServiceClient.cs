using System.Net;
using System.Net.Http.Headers;
using System.Net.Http.Json;

namespace MicroservicioProfesores.Services
{
    public class ParametroServiceClient : IParametroServiceClient
    {
        private readonly HttpClient _httpClient;

        public ParametroServiceClient(HttpClient httpClient)
        {
            _httpClient = httpClient;
        }

        public async Task<string?> ObtenerValorAsync(string identificador, Guid usuario, string token)
        {
            using var request = new HttpRequestMessage(HttpMethod.Get, $"api/parametro/{Uri.EscapeDataString(identificador)}");
            request.Headers.Authorization = new AuthenticationHeaderValue("Bearer", token);
            request.Headers.Add("UsuarioGUID", usuario.ToString());

            using var response = await _httpClient.SendAsync(request);

            if (response.StatusCode == HttpStatusCode.NotFound)
                return null;

            response.EnsureSuccessStatusCode();

            var parametro = await response.Content.ReadFromJsonAsync<ParametroResponse>();
            return parametro?.Valor;
        }

        private class ParametroResponse
        {
            public string Valor { get; set; } = string.Empty;
        }
    }
}