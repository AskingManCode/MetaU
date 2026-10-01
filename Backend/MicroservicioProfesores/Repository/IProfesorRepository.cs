using MicroservicioProfesores.Entities;

namespace MicroservicioProfesores.Repository
{
    public interface IProfesorRepository
    {
        Task<Profesor> CrearAsync(Profesor profesor);
        Task ModificarAsync(Profesor profesor);
        Task EliminarAsync(int profesorID);
        Task<IEnumerable<Profesor>> ObtenerTodosAsync();
        Task<Profesor?> ObtenerPorIdAsync(int profesorID);
    }
}