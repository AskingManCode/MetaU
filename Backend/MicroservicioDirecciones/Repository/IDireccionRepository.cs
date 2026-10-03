using MicroservicioDirecciones.Entities;

namespace MicroservicioDirecciones.Repository
{
    public interface IDireccionRepository
    {
        Task<IEnumerable<ProvinciaResponse>> ObtenerProvinciasAsync();
        Task<IEnumerable<CantonResponse>> ObtenerCantonesAsync(Guid ProvinciaID);
        Task<IEnumerable<DistritoResponse>> ObtenerDistritosAsync(Guid ProvinciaID, Guid CantonID);
    }
}
