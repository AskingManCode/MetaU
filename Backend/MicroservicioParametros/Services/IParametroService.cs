using MicroservicioParametros.Entities;

namespace MicroservicioParametros.Services
{
    public interface IParametroService
    {
        Task<ParametroResponse> CrearAsync(ParametroRequest request);
    }
}