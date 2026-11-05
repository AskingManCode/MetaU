using MicroservicioProfesores.Entities;

namespace MicroservicioProfesores.Repository
{
    public interface IProfesorRepository
    {
        Task<Profesor> CrearAsync(Profesor profesor);
        Task ModificarAsync(Profesor profesor);
        Task EliminarAsync(Guid profesorID);
        Task<IEnumerable<Profesor>> ObtenerTodosAsync();
        Task<Profesor?> ObtenerPorIdAsync(Guid profesorID);
    }
}