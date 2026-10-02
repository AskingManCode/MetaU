using System.Net.Http.Headers;
using System.Net.Http.Json;

namespace MicroservicioNotas.Services
{
    public class ExpedienteClient : IExpedienteClient
    {
        private readonly HttpClient _http;

        public ExpedienteClient(HttpClient http)
        {
            _http = http;
        }

        private record ExpedienteResponse(Guid EstudianteID);

        public async Task<Guid?> ObtenerEstudianteID(string identificacion, ContextoUsuario contexto)
        {
            using var request = new HttpRequestMessage(HttpMethod.Get, $"/expediente/{identificacion}");
            request.Headers.Authorization = new AuthenticationHeaderValue("Bearer", contexto.Token);
            request.Headers.Add("Usuario", contexto.UsuarioId.ToString());

            using var response = await _http.SendAsync(request);
            if (!response.IsSuccessStatusCode) return null;

            var expediente = await response.Content.ReadFromJsonAsync<ExpedienteResponse>(
                new System.Text.Json.JsonSerializerOptions { PropertyNameCaseInsensitive = true });
            return expediente?.EstudianteID;
        }
    }
}
