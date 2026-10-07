using System.Net;
using System.Net.Http.Headers;
using System.Net.Http.Json;
using System.Text.Json;

namespace MicroservicioMatriculas.Services
{
    public class CursoClient : ICursoClient
    {
        private static readonly JsonSerializerOptions JsonOpts = new() { PropertyNameCaseInsensitive = true };
        private readonly HttpClient _http;

        public CursoClient(HttpClient http)
        {
            _http = http;
        }

        public async Task<CursoInfo?> ObtenerPorCodigo(string cursoCode, ContextoUsuario contexto)
        {
            using var request = new HttpRequestMessage(HttpMethod.Get, $"/curso/{Uri.EscapeDataString(cursoCode)}");
            request.Headers.Authorization = new AuthenticationHeaderValue("Bearer", contexto.Token);
            request.Headers.Add("X-Usuario-Id", contexto.UsuarioId.ToString());

            using var response = await _http.SendAsync(request);
            if (response.StatusCode == HttpStatusCode.NotFound) return null;
            response.EnsureSuccessStatusCode();

            return await response.Content.ReadFromJsonAsync<CursoInfo>(JsonOpts);
        }
    }
}
