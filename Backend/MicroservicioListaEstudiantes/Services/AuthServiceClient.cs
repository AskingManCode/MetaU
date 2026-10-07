using System.Net.Http.Headers;

namespace MicroservicioListaEstudiantes.Services
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
            if (string.IsNullOrWhiteSpace(token))
                return false;

            try
            {
                using var request = new HttpRequestMessage(HttpMethod.Post, "validate");
                request.Headers.Authorization = new AuthenticationHeaderValue("Bearer", token);

                using var response = await _httpClient.SendAsync(request);

                if (!response.IsSuccessStatusCode)
                    return false;

                var contenido = await response.Content.ReadAsStringAsync();
                return bool.TryParse(contenido, out var valido) && valido;
            }
            catch (HttpRequestException)
            {
                return false;
            }
        }
    }
}