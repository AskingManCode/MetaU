using MicroservicioBitacoras.Entities;

namespace MicroservicioBitacoras.Repository
{
    public interface IBitacoraRepository
    {
        Task RegistrarAsync(int usuario, string descripcion);
        Task<IEnumerable<Bitacora>> ObtenerTodosAsync();
    }
}