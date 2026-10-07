using System.Net;
using System.Net.Http.Headers;
using System.Net.Http.Json;

namespace MicroservicioUsuarios.Services
{
    public class RolServiceClient : IRolServiceClient
    {
        private readonly HttpClient _httpClient;

        public RolServiceClient(HttpClient httpClient)
        {
            _httpClient = httpClient;
        }

        public async Task<RolDto?> ObtenerPorIdAsync(string idRol, Guid usuarioId, string token)
        {
            using var request = new HttpRequestMessage(HttpMethod.Get, $"rol/{idRol}");
            request.Headers.Authorization = new AuthenticationHeaderValue("Bearer", token);
            request.Headers.Add("X-Usuario-Id", usuarioId.ToString());

            using var response = await _httpClient.SendAsync(request);

            if (response.StatusCode == HttpStatusCode.NotFound)
                return null;

            response.EnsureSuccessStatusCode();
            return await response.Content.ReadFromJsonAsync<RolDto>();
        }
    }
}