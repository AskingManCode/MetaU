using System.Net.Http.Json;

namespace MicroservicioNotas.Services
{
    public class GrupoClient : IGrupoClient
    {
        private readonly HttpClient _http;

        public GrupoClient(HttpClient http)
        {
            _http = http;
        }

        public async Task<GrupoInfo?> ObtenerPorCodigo(string grupoCode)
        {
            var response = await _http.GetAsync($"/grupo/{grupoCode}");
            if (!response.IsSuccessStatusCode) return null;

            return await response.Content.ReadFromJsonAsync<GrupoInfo>();
        }
    }
}
