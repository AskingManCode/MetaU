using System.Net.Http.Headers;
using System.Net.Http.Json;

namespace MicroservicioCarreras.Services
{
    // Bitacoras valida su propio token Y lee el usuario del header X-Usuario-Id
    // (no del body) — confirmado leyendo su codigo real. Por eso se mandan los dos.
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
            request.Content = JsonContent.Create(new { usuario, descripcion });

            using var response = await _httpClient.SendAsync(request);
            response.EnsureSuccessStatusCode();
        }
    }
}
