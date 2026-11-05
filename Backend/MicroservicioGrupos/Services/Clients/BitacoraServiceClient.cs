using System.Net.Http.Headers;
using System.Net.Http.Json;

namespace MicroservicioGrupos.Services
{
    public class BitacoraServiceClient : IBitacoraServiceClient
    {
        private readonly HttpClient _httpClient;

        public BitacoraServiceClient(HttpClient httpClient)
        {
            _httpClient = httpClient;
        }

        public async Task RegistrarAsync(Guid usuario, string descripcion, string token)
        {
            using var request = new HttpRequestMessage(HttpMethod.Post, "bitacora");
            request.Headers.Authorization = new AuthenticationHeaderValue("Bearer", token);
            request.Headers.Add("X-Usuario-Id", usuario.ToString());
            request.Content = JsonContent.Create(new
            {
                Descripcion = descripcion
            });

            using var response = await _httpClient.SendAsync(request);
            response.EnsureSuccessStatusCode();
        }
    }
}