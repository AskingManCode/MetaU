using System.Net;
using System.Net.Http.Headers;
using System.Net.Http.Json;

namespace MicroservicioListaEstudiantes.Services
{
    public class CursoServiceClient : ICursoServiceClient
    {
        private readonly HttpClient _httpClient;

        public CursoServiceClient(HttpClient httpClient)
        {
            _httpClient = httpClient;
        }

        public async Task<CursoDto?> ObtenerPorIdAsync(string id, Guid usuarioId, string token)
        {
            try
            {
                using var request = new HttpRequestMessage(HttpMethod.Get, $"curso/{id}");
                request.Headers.Authorization = new AuthenticationHeaderValue("Bearer", token);
                request.Headers.Add("X-Usuario-Id", usuarioId.ToString());

                using var response = await _httpClient.SendAsync(request);
                if (response.StatusCode == HttpStatusCode.NotFound) return null;
                if (!response.IsSuccessStatusCode) return null;

                return await response.Content.ReadFromJsonAsync<CursoDto>();
            }
            catch (HttpRequestException)
            {
                return null; 
            }
        }
    }
}
