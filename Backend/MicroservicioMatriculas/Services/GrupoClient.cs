using System.Net;
using System.Net.Http.Headers;
using System.Net.Http.Json;
using System.Text.Json;

namespace MicroservicioMatriculas.Services
{
    public class GrupoClient : IGrupoClient
    {
        private static readonly JsonSerializerOptions JsonOpts = new() { PropertyNameCaseInsensitive = true };
        private readonly HttpClient _http;

        public GrupoClient(HttpClient http)
        {
            _http = http;
        }

        public async Task<GrupoInfo?> ObtenerPorCodigo(string grupoCode, ContextoUsuario contexto)
        {
            using var request = new HttpRequestMessage(HttpMethod.Get, $"/grupo/{Uri.EscapeDataString(grupoCode)}");
            request.Headers.Authorization = new AuthenticationHeaderValue("Bearer", contexto.Token);
            request.Headers.Add("X-Usuario-Id", contexto.UsuarioId.ToString());

            using var response = await _http.SendAsync(request);
            if (response.StatusCode == HttpStatusCode.NotFound) return null;
            response.EnsureSuccessStatusCode();

            return await response.Content.ReadFromJsonAsync<GrupoInfo>(JsonOpts);
        }
    }
}
