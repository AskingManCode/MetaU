using MicroservicioParametros.Entities;
using MicroservicioParametros.Repository;

namespace MicroservicioParametros.Services
{
    public class ParametroService: IParametroService
    {
        private readonly IParametroRepository _repository;

        public ParametroService(IParametroRepository repository)
        {
            this._repository = repository;
        }

        public async Task<ParametroResponse> CrearAsync(ParametroRequest request)
        {   
            return await _repository.CrearAsync(request);
        }
    }
}
