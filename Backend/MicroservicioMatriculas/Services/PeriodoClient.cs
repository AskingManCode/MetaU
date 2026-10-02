using System.Net;
using System.Net.Http.Headers;
using System.Net.Http.Json;

namespace MicroservicioMatriculas.Services
{
    public class PeriodoClient : IPeriodoClient
    {
        private readonly HttpClient _http;

        public PeriodoClient(HttpClient http)
        {
            _http = http;
        }

        public async Task<PeriodoInfo?> ObtenerPorId(Guid periodoId, ContextoUsuario contexto)
        {
            using var request = new HttpRequestMessage(HttpMethod.Get, $"/periodo/{periodoId}");
            request.Headers.Authorization = new AuthenticationHeaderValue("Bearer", contexto.Token);
            request.Headers.Add("X-Usuario-Id", contexto.UsuarioId.ToString());

            using var response = await _http.SendAsync(request);
            if (response.StatusCode == HttpStatusCode.NotFound) return null;
            response.EnsureSuccessStatusCode();

            return await response.Content.ReadFromJsonAsync<PeriodoInfo>();
        }
    }
}
