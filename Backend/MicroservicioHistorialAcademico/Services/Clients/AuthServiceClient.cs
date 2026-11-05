using System.Net;
using System.Net.Http.Headers;
using System.Net.Http.Json;

namespace MicroservicioHistorialAcademico.Services
{
    public class AuthServiceClient : IAuthServiceClient
    {
        private readonly HttpClient _httpClient;

        public AuthServiceClient(HttpClient httpClient)
        {
            _httpClient = httpClient;
        }

        public async Task<bool> ValidarAsync(string token)
        {
            using var request = new HttpRequestMessage(HttpMethod.Post, "validate");
            request.Headers.Authorization = new AuthenticationHeaderValue("Bearer", token);

            using var response = await _httpClient.SendAsync(request);

            if (response.StatusCode == HttpStatusCode.Unauthorized)
                return false;

            response.EnsureSuccessStatusCode();

            return await response.Content.ReadFromJsonAsync<bool>();
        }
    }
}