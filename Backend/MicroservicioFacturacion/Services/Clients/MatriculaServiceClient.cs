using System.Net.Http.Headers;
using MicroservicioFacturacion.Entities.DTOs;

namespace MicroservicioFacturacion.Services.Clients
{
    public sealed class MatriculaServiceClient(HttpClient httpClient) : IMatriculaServiceClient
    {
        public async Task<IReadOnlyList<MatriculaFacturacionResponse>> ObtenerPorEstudianteAsync(
            string identificacion, Guid usuarioId, string token)
        {
            var path = $"matricula/?identificacion={Uri.EscapeDataString(identificacion)}";
            using var request = new HttpRequestMessage(HttpMethod.Get, path);
            request.Headers.Authorization = new AuthenticationHeaderValue("Bearer", token);
            request.Headers.Add("X-Usuario-Id", usuarioId.ToString());

            using var response = await httpClient.SendAsync(request);
            response.EnsureSuccessStatusCode();

            return await response.Content.ReadFromJsonAsync<List<MatriculaFacturacionResponse>>()
                ?? throw new InvalidOperationException("El servicio de matrícula devolvió una respuesta vacía.");
        }
    }
}
