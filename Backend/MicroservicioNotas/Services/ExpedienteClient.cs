using System.Net.Http.Headers;

namespace MicroservicioNotas.Services
{
    public class ExpedienteClient : IExpedienteClient
    {
        private readonly HttpClient _http;

        public ExpedienteClient(HttpClient http)
        {
            _http = http;
        }

        public async Task<bool> Existe(string identificacion, ContextoUsuario contexto)
        {
            using var request = new HttpRequestMessage(HttpMethod.Get, $"/expediente/{identificacion}");
            request.Headers.Authorization = new AuthenticationHeaderValue("Bearer", contexto.Token);
            request.Headers.Add("Usuario", contexto.UsuarioId.ToString());

            using var response = await _http.SendAsync(request);
            return response.IsSuccessStatusCode;
        }
    }
}
