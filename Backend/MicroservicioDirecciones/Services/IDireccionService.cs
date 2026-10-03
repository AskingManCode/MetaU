using MicroservicioDirecciones.Entities;

namespace MicroservicioDirecciones.Services
{
    public interface IDireccionService
    {
        Task<IEnumerable<ProvinciaResponse>> ObtenerProvinciasAsync();
        Task<IEnumerable<CantonResponse>> ObtenerCantonesAsync(Guid ProvinciaID);
        Task<IEnumerable<DistritoResponse>> ObtenerDistritosAsync(Guid ProvinciaID, Guid CantonID);
    }
}
