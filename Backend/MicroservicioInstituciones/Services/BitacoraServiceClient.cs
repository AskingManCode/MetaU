using System.Net.Http.Json;

namespace MicroservicioInstituciones.Services
{
    public class BitacoraServiceClient : IBitacoraServiceClient
    {
        private readonly HttpClient _httpClient;

        public BitacoraServiceClient(HttpClient httpClient)
        {
            _httpClient = httpClient;
        }

        public async Task RegistrarAsync(Guid usuario, string descripcion)
        {
            var body = new { usuario, descripcion };
            var response = await _httpClient.PostAsJsonAsync("bitacora", body);
            response.EnsureSuccessStatusCode();
        }
    }
}
