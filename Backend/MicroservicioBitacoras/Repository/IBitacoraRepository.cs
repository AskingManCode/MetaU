using MicroservicioBitacoras.Entities;

namespace MicroservicioBitacoras.Repository
{
    public interface IBitacoraRepository
    {
        Task RegistrarAsync(Guid usuario, string descripcion);
        Task<IEnumerable<Bitacora>> ObtenerTodosAsync();
    }
}