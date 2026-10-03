using MicroservicioDirecciones.Entities;
using MicroservicioDirecciones.Repository;

namespace MicroservicioDirecciones.Services
{
    public class DireccionService : IDireccionService
    {
        private readonly IDireccionRepository _repository;

        public DireccionService(IDireccionRepository repository)
        {
            this._repository = repository;
        }

        public async Task<IEnumerable<ProvinciaResponse>> ObtenerProvinciasAsync()
        {
            return await _repository.ObtenerProvinciasAsync();
        }

        public async Task<IEnumerable<CantonResponse>> ObtenerCantonesAsync(Guid ProvinciaID)
        {
            if (ProvinciaID == Guid.Empty)
                throw new ArgumentException("El ID de la provincia es obligatorio.");

            return await _repository.ObtenerCantonesAsync(ProvinciaID);
        }

        public async Task<IEnumerable<DistritoResponse>> ObtenerDistritosAsync(Guid ProvinciaID, Guid CantonID)
        {
            if (ProvinciaID == Guid.Empty)
                throw new ArgumentException("El ID de la provincia es obligatorio.");

            if (CantonID == Guid.Empty)
                throw new ArgumentException("El ID del cantón es obligatorio.");

            return await _repository.ObtenerDistritosAsync(ProvinciaID, CantonID);
        }
    }
}
