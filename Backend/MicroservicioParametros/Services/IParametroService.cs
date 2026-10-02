using MicroservicioParametros.Entities;

namespace MicroservicioParametros.Services
{
    public interface IParametroService
    {
        Task<ParametroResponse> CrearAsync(ParametroRequest request);
        Task<ParametroResponse?> ObtenerPorIDAsync(string parametroCode);
        Task<ParametroResponse?> ModificarAsync(string parametroCode, ParametroRequest request);
        Task<IEnumerable<ParametroResponse>> ObtenerTodosAsync();
        Task<ParametroResponse?> EliminarAsync(string parametroCode, bool eliminacionFisica);
    }
}