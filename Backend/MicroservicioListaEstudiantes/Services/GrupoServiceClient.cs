using System.Net.Http.Headers;
using System.Net.Http.Json;

namespace MicroservicioListaEstudiantes.Services
{
    public class GrupoServiceClient : IGrupoServiceClient
    {
        private readonly HttpClient _httpClient;

        public GrupoServiceClient(HttpClient httpClient)
        {
            _httpClient = httpClient;
        }

        public async Task<IEnumerable<GrupoDto>> ObtenerTodosAsync(Guid usuarioId, string token)
        {
            using var request = new HttpRequestMessage(HttpMethod.Get, "grupo");
            request.Headers.Authorization = new AuthenticationHeaderValue("Bearer", token);
            request.Headers.Add("X-Usuario-Id", usuarioId.ToString());

            using var response = await _httpClient.SendAsync(request);
            response.EnsureSuccessStatusCode();

            return await response.Content.ReadFromJsonAsync<IEnumerable<GrupoDto>>() ?? [];
        }
    }
}