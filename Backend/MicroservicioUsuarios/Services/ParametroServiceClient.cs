using System.Net;
using System.Net.Http.Headers;
using System.Text.Json;

namespace MicroservicioUsuarios.Services
{
    public class ParametroServiceClient : IParametroServiceClient
    {
        private readonly HttpClient _httpClient;

        public ParametroServiceClient(HttpClient httpClient)
        {
            _httpClient = httpClient;
        }

        public async Task<string?> ObtenerValorAsync(string parametroCode, Guid usuarioId, string token)
        {
            using var request = new HttpRequestMessage(HttpMethod.Get, $"api/parametro/{parametroCode}");
            request.Headers.Authorization = new AuthenticationHeaderValue("Bearer", token);
            request.Headers.Add("UsuarioGUID", usuarioId.ToString());

            using var response = await _httpClient.SendAsync(request);

            if (response.StatusCode == HttpStatusCode.NotFound)
                return null;

            response.EnsureSuccessStatusCode();

            var contenido = await response.Content.ReadAsStringAsync();
            using var doc = JsonDocument.Parse(contenido);
            return doc.RootElement.GetProperty("valor").GetString();
        }
    }
}