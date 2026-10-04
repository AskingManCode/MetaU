using System.Net;
using System.Net.Http.Headers;
using System.Net.Http.Json;

namespace MicroservicioInstituciones.Services
{
    // Igual al patron real de MicroservicioBitacoras: llama al /validate de Login
    // por HTTP, no decodifica el JWT (no tiene la clave secreta para hacerlo).
    public class AuthServiceClient : IAuthServiceClient
    {
        private readonly HttpClient _httpClient;

        public AuthServiceClient(HttpClient httpClient)
        {
            _httpClient = httpClient;
        }

        public async Task<bool> ValidarTokenAsync(string token)
        {
            using var request = new HttpRequestMessage(HttpMethod.Post, "validate");
            request.Headers.Authorization = new AuthenticationHeaderValue("Bearer", token);
            var response = await _httpClient.SendAsync(request);

            if (response.StatusCode == HttpStatusCode.Unauthorized)
                return false;

            response.EnsureSuccessStatusCode();
            return await response.Content.ReadFromJsonAsync<bool>();
        }
    }
}
