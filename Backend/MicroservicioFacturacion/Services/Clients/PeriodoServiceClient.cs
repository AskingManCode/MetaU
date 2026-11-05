using System.Net;
using System.Net.Http.Headers;

namespace MicroservicioFacturacion.Services.Clients
{
    public class PeriodoServiceClient : IPeriodoServiceClient
    {
        private readonly HttpClient _httpClient;

        public PeriodoServiceClient(HttpClient httpClient)
        {
            _httpClient = httpClient;
        }

        public async Task<bool> ObtenerPorIdAsync(Guid periodoId, Guid usuarioId, string token)
        {
            var path = $"periodo/{periodoId}";

            using var request = new HttpRequestMessage(HttpMethod.Get, path);
            request.Headers.Authorization = new AuthenticationHeaderValue("Bearer", token);
            request.Headers.Add("X-Usuario-Id", usuarioId.ToString());

            using var response = await _httpClient.SendAsync(request);

            if (response.StatusCode == HttpStatusCode.NotFound)
                return false;

            response.EnsureSuccessStatusCode();
            
            return true;
        }
    }
}