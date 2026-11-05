using System.Net;
using System.Net.Http.Headers;
using System.Net.Http.Json;

namespace MicroservicioHistorialAcademico.Services
{
    public class CursoServiceClient : ICursoServiceClient
    {
        private readonly HttpClient _httpClient;

        public CursoServiceClient(HttpClient httpClient)
        {
            _httpClient = httpClient;
        }

        public async Task<CursoResponse?> ObtenerPorCodigoAsync(string cursoCode, Guid usuario, string token)
        {
            using var request = new HttpRequestMessage(HttpMethod.Get, $"curso/{Uri.EscapeDataString(cursoCode)}");
            request.Headers.Authorization = new AuthenticationHeaderValue("Bearer", ObtenerToken(token));
            request.Headers.Add("X-Usuario-Id", usuario.ToString());

            using var response = await _httpClient.SendAsync(request);

            if (response.StatusCode == HttpStatusCode.NotFound)
                return null;

            response.EnsureSuccessStatusCode();

            return await response.Content.ReadFromJsonAsync<CursoResponse>();
        }

        private static string ObtenerToken(string token)
        {
            const string prefijo = "Bearer ";
            return token.StartsWith(prefijo, StringComparison.OrdinalIgnoreCase) ? token[prefijo.Length..] : token;
        }
    }
}