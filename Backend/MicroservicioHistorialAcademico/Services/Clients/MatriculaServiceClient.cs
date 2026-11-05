using System.Net.Http.Headers;
using System.Net.Http.Json;

namespace MicroservicioHistorialAcademico.Services
{
    public class MatriculaServiceClient : IMatriculaServiceClient
    {
        private readonly HttpClient _httpClient;

        public MatriculaServiceClient(HttpClient httpClient)
        {
            _httpClient = httpClient;
        }

        public async Task<List<MatriculaResponse>> ObtenerPorEstudianteAsync(string identificacion, Guid usuario, string token)
        {
            var url = $"matricula?identificacion={Uri.EscapeDataString(identificacion)}";

            using var request = new HttpRequestMessage(HttpMethod.Get, url);
            request.Headers.Authorization = new AuthenticationHeaderValue("Bearer", ObtenerToken(token));
            request.Headers.Add("X-Usuario-Id", usuario.ToString());

            using var response = await _httpClient.SendAsync(request);

            response.EnsureSuccessStatusCode();

            return await response.Content.ReadFromJsonAsync<List<MatriculaResponse>>() ?? [];
        }

        private static string ObtenerToken(string token)
        {
            const string prefijo = "Bearer ";

            return token.StartsWith(prefijo, StringComparison.OrdinalIgnoreCase)
                ? token[prefijo.Length..]
                : token;
        }
    }
}