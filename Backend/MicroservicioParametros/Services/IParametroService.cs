using MicroservicioParametros.Entities;

namespace MicroservicioParametros.Services
{
    public interface IParametroService
    {
        Task<ParametroResponse> CrearAsync(ParametroRequest request, HttpRequest httpRequest);
        Task<ParametroResponse?> ModificarAsync(string parametroCode, ParametroRequest request, HttpRequest httpRequest);
        Task<ParametroResponse?> EliminarAsync(string parametroCode, bool eliminacionFisica, HttpRequest httpRequest);
        Task<ParametroResponse?> ObtenerPorIDAsync(string parametroCode, HttpRequest httpRequest);
        Task<IEnumerable<ParametroResponse>> ObtenerTodosAsync(HttpRequest httpRequest);
    }
}