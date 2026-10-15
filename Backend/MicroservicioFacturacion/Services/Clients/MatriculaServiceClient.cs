using System.Net.Http.Headers;
using MicroservicioFacturacion.Entities;

namespace MicroservicioFacturacion.Services.Clients
{
    public class MatriculaServiceClient : IMatriculaServiceClient
    {
        private readonly HttpClient _httpClient;

        public MatriculaServiceClient(HttpClient httpClient)
        {
            _httpClient = httpClient;
        }

        public async Task<IReadOnlyList<MatriculaFacturacionResponse>> ObtenerPorEstudianteAsync(string identificacion, Guid usuarioId, string token)
        {
            var path = $"matricula/?identificacion={Uri.EscapeDataString(identificacion)}";

            using var request = new HttpRequestMessage(HttpMethod.Get, path);
            request.Headers.Authorization = new AuthenticationHeaderValue("Bearer", token);
            request.Headers.Add("X-Usuario-Id", usuarioId.ToString());

            using var response = await _httpClient.SendAsync(request);
            response.EnsureSuccessStatusCode();

            var matriculas = await response.Content.ReadFromJsonAsync<List<MatriculaFacturacionResponse>>();

            return matriculas ?? new List<MatriculaFacturacionResponse>();
        }
    }
}