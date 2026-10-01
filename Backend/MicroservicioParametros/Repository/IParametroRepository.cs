using MicroservicioParametros.Entities;

namespace MicroservicioParametros.Repository
{
    public interface IParametroRepository
    {
        Task<ParametroResponse> CrearAsync(ParametroRequest request); 
    }
}