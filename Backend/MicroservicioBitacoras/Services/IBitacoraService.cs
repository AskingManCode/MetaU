using MicroservicioBitacoras.Entities;

namespace MicroservicioBitacoras.Services
{
    public interface IBitacoraService
    {
        Task RegistrarAsync(BitacoraRequest request);

        Task<IEnumerable<Bitacora>> ObtenerTodosAsync();

        Task<PaginaResultado<Bitacora>> ObtenerPaginadoAsync(
            int pagina, Guid usuario, string token);
    }
}