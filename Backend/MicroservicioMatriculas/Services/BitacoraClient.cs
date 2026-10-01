using System.Net.Http.Headers;
using System.Net.Http.Json;

namespace MicroservicioMatriculas.Services
{
    public class BitacoraClient : IBitacoraClient
    {
        private readonly HttpClient _http;

        public BitacoraClient(HttpClient http)
        {
            _http = http;
        }

        public async Task Registrar(ContextoUsuario contexto, string descripcion)
        {
            using var request = new HttpRequestMessage(HttpMethod.Post, "bitacora")
            {
                Content = JsonContent.Create(new { Usuario = contexto.UsuarioId, Descripcion = descripcion })
            };
            request.Headers.Authorization = new AuthenticationHeaderValue("Bearer", contexto.Token);

            using var response = await _http.SendAsync(request);
            response.EnsureSuccessStatusCode();
        }
    }
}
