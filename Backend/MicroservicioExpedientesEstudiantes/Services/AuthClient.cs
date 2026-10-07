using System.Net;
using System.Net.Http.Headers;
using System.Net.Http.Json;

namespace MicroservicioExpedientesEstudiantes.Services
{
    public class AuthClient : IAuthClient
    {
        private readonly HttpClient _http;

        public AuthClient(HttpClient http)
        {
            _http = http;
        }

        public async Task<bool> Validate(string token)
        {
            using var request = new HttpRequestMessage(HttpMethod.Post, "validate");
            request.Headers.Authorization = new AuthenticationHeaderValue("Bearer", token);

            using var response = await _http.SendAsync(request);

            if (response.StatusCode == HttpStatusCode.Unauthorized) return false;
            response.EnsureSuccessStatusCode();

            return await response.Content.ReadFromJsonAsync<bool>();
        }
    }
}
