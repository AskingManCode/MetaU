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

        public async Task<ParametroResponse?> ObtenerPorIDAsync(string parametroCode)
        {
            if (string.IsNullOrWhiteSpace(parametroCode))
                throw new ArgumentException("El código del parámetro es obligatorio.");

            return await _repository.ObtenerPorIDAsync(parametroCode);
        }

        public async Task<ParametroResponse?> ModificarAsync(string parametroCode, ParametroRequest request)
        {
            if (string.IsNullOrWhiteSpace(parametroCode))
                throw new ArgumentException("El código del parámetro es obligatorio.");

            return await _repository.ModificarAsync(parametroCode, request);
        }

        public async Task<IEnumerable<ParametroResponse>> ObtenerTodosAsync()
        {
            return await _repository.ObtenerTodosAsync();
        }

        public async Task<ParametroResponse?> EliminarAsync(string parametroCode, bool eliminacionFisica)
        {
            if (string.IsNullOrWhiteSpace(parametroCode))
                throw new ArgumentException("El código del parámetro es obligatorio.");

            return await _repository.EliminarAsync(parametroCode, eliminacionFisica);
        }
    }
}
