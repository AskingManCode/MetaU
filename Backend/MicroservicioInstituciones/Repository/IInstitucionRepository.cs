using MicroservicioInstituciones.Entities;

namespace MicroservicioInstituciones.Repository
{
    public interface IInstitucionRepository
    {
        Task<Institucion?> ObtenerPorIdAsync(string institucionCode);
        Task<IEnumerable<Institucion>> ObtenerTodosAsync();
        Task<bool> ExisteAsync(string institucionCode);
        Task CrearAsync(Institucion institucion);
        Task<bool> ActualizarAsync(string institucionCode, string nombre);
        Task<bool> EliminarAsync(string institucionCode);
    }
}
