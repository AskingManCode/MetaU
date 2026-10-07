using System.Net.Http.Headers;
using System.Net.Http.Json;

namespace MicroservicioListaEstudiantes.Services
{
    public class MatriculaServiceClient : IMatriculaServiceClient
    {
        private readonly HttpClient _httpClient;

        public MatriculaServiceClient(HttpClient httpClient)
        {
            _httpClient = httpClient;
        }

        public async Task<IEnumerable<EstudianteMatriculadoDto>> ObtenerPorCursoYGrupoAsync(string cursoCode, string grupoCode, Guid usuarioId, string token)
        {
            using var request = new HttpRequestMessage(HttpMethod.Get, $"matricula?cursoCode={cursoCode}&grupoCode={grupoCode}");
            request.Headers.Authorization = new AuthenticationHeaderValue("Bearer", token);
            request.Headers.Add("X-Usuario-Id", usuarioId.ToString());

            using var response = await _httpClient.SendAsync(request);
            if (!response.IsSuccessStatusCode)
                return [];

            return await response.Content.ReadFromJsonAsync<IEnumerable<EstudianteMatriculadoDto>>() ?? [];
        }
    }
}