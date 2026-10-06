using System.Net.Http.Headers;
using System.Net.Http.Json;

namespace MicroservicioHistorialAcademico.Services
{
    public class NotasServiceClient : INotasServiceClient
    {
        private readonly HttpClient _httpClient;

        public NotasServiceClient(HttpClient httpClient)
        {
            _httpClient = httpClient;
        }

        public async Task<List<NotaRubroResponse>> ObtenerNotasAsync(string identificacion, string codigoCurso, string grupoCode, Guid usuario, string token)
        {
            var url = $"obtenernotas?identificacion={Uri.EscapeDataString(identificacion)}&cursoCode={Uri.EscapeDataString(codigoCurso)}&grupoCode={Uri.EscapeDataString(grupoCode)}";
            using var request = CrearRequest(HttpMethod.Get, url, usuario, token);
            using var response = await _httpClient.SendAsync(request);

            response.EnsureSuccessStatusCode();

            return await response.Content.ReadFromJsonAsync<List<NotaRubroResponse>>() ?? [];
        }

        public async Task<List<RubroResponse>> ObtenerDesgloseAsync(string codigoGrupo, Guid usuario, string token)
        {
            var url = $"obtenerdesglose?grupoCode={Uri.EscapeDataString(codigoGrupo)}";
            using var request = CrearRequest(HttpMethod.Get, url, usuario, token);
            using var response = await _httpClient.SendAsync(request);

            response.EnsureSuccessStatusCode();

            return await response.Content.ReadFromJsonAsync<List<RubroResponse>>() ?? [];
        }

        private static HttpRequestMessage CrearRequest(HttpMethod metodo, string url, Guid usuario, string token)
        {
            var request = new HttpRequestMessage(metodo, url);
            request.Headers.Authorization = new AuthenticationHeaderValue("Bearer", ObtenerToken(token));
            request.Headers.Add("X-Usuario-Id", usuario.ToString());
            return request;
        }

        private static string ObtenerToken(string token)
        {
            const string prefijo = "Bearer ";
            return token.StartsWith(prefijo, StringComparison.OrdinalIgnoreCase) ? token[prefijo.Length..] : token;
        }
    }
}