using MicroservicioInstituciones.Entities;

namespace MicroservicioInstituciones.Services
{
    public interface IInstitucionService
    {
        Task<Institucion?> ObtenerPorIdAsync(string institucionCode);
        Task<IEnumerable<Institucion>> ObtenerTodosAsync();
        Task CrearAsync(Institucion institucion);
        Task<bool> ActualizarAsync(string institucionCode, string nombre);
        Task<bool> EliminarAsync(string institucionCode);
    }
}
