using System.Globalization;
using System.Net;
using System.Net.Http.Headers;
using System.Net.Http.Json;

namespace MicroservicioNotas.Services
{
    public class ParametroClient : IParametroClient
    {
        private readonly HttpClient _http;

        private static readonly Dictionary<string, decimal> ValoresPorDefecto = new()
        {
            ["TOTRUBRO"] = 100m,
            ["NOTAMIN"] = 1m,
            ["NOTAMAX"] = 100m
        };

        public ParametroClient(HttpClient http)
        {
            _http = http;
        }

        public async Task<decimal> ObtenerValorNumerico(string identificador, ContextoUsuario contexto)
        {
            try
            {
                using var request = new HttpRequestMessage(
                    HttpMethod.Get, $"api/parametro/{Uri.EscapeDataString(identificador)}");
                request.Headers.Authorization = new AuthenticationHeaderValue("Bearer", contexto.Token);
                request.Headers.Add("UsuarioGUID", contexto.UsuarioId.ToString());

                using var response = await _http.SendAsync(request);
                if (response.StatusCode == HttpStatusCode.NotFound)
                    return ValoresPorDefecto.GetValueOrDefault(identificador, 0m);

                response.EnsureSuccessStatusCode();
                var parametro = await response.Content.ReadFromJsonAsync<ParametroResponse>();

                return parametro is { Estado: true } &&
                       decimal.TryParse(parametro.Valor, NumberStyles.Number, CultureInfo.InvariantCulture, out var valor)
                    ? valor
                    : ValoresPorDefecto.GetValueOrDefault(identificador, 0m);
            }
            catch (HttpRequestException)
            {
                return ValoresPorDefecto.GetValueOrDefault(identificador, 0m);
            }
        }

        private class ParametroResponse
        {
            public string ParametroCode { get; set; } = string.Empty;
            public string Valor { get; set; } = string.Empty;
            public bool Estado { get; set; }
        }
    }
}
