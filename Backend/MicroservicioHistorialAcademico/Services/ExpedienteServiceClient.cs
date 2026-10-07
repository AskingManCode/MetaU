using System.Net;
using System.Net.Http.Headers;
using System.Net.Http.Json;

namespace MicroservicioHistorialAcademico.Services
{
    public class ExpedienteServiceClient : IExpedienteServiceClient
    {
        private readonly HttpClient _httpClient;

        public ExpedienteServiceClient(HttpClient httpClient)
        {
            _httpClient = httpClient;
        }

        public async Task<bool> ValidarEstudianteAsync(
            string tipoIdentificacion,
            string identificacion,
            Guid usuario,
            string token)
        {
            using var request = new HttpRequestMessage(
                HttpMethod.Get,
                $"expediente/{Uri.EscapeDataString(identificacion)}");

            request.Headers.Authorization = new AuthenticationHeaderValue(
                "Bearer",
                ObtenerToken(token));

            request.Headers.Add("X-Usuario-Id", usuario.ToString());

            using var response = await _httpClient.SendAsync(request);

            if (response.StatusCode == HttpStatusCode.NotFound)
                return false;

            response.EnsureSuccessStatusCode();

            var estudiante = await response.Content.ReadFromJsonAsync<EstudianteResponse>();

            if (estudiante is null)
                return false;

            return string.Equals(
                estudiante.TipoIdentificacion,
                tipoIdentificacion,
                StringComparison.OrdinalIgnoreCase);
        }

        private static string ObtenerToken(string token)
        {
            const string prefijo = "Bearer ";

            return token.StartsWith(
                prefijo,
                StringComparison.OrdinalIgnoreCase)
                    ? token[prefijo.Length..]
                    : token;
        }

        private class EstudianteResponse
        {
            public string TipoIdentificacion { get; set; } = string.Empty;
        }
    }
}