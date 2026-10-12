using MicroservicioProfesores.Entities;

namespace MicroservicioProfesores.Services
{
    public interface IProfesorService
    {
        Task<Profesor> CrearAsync(Profesor profesor, Guid usuario, string token);
        Task ModificarAsync(Profesor profesor, Guid usuario, string token);
        Task EliminarAsync(Guid profesorID);
        Task<IEnumerable<Profesor>> ObtenerTodosAsync();
        Task<Profesor> ObtenerPorIdAsync(Guid profesorID);
    }
}