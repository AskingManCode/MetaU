using MicroservicioBitacoras.Entities;

namespace MicroservicioBitacoras.Services
{
    public interface IBitacoraService
    {
        Task RegistrarAsync(BitacoraRequest request);
        Task<IEnumerable<Bitacora>> ObtenerTodosAsync();
    }
}