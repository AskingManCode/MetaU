using MicroservicioProfesores.Entities;

namespace MicroservicioProfesores.Services
{
    public interface IProfesorService
    {
        Task<Profesor> CrearAsync(Profesor profesor, string dominioCorreo);
        Task ModificarAsync(Profesor profesor, string dominioCorreo);
        Task EliminarAsync(int profesorID);
        Task<IEnumerable<Profesor>> ObtenerTodosAsync();
        Task<Profesor?> ObtenerPorIdAsync(int profesorID);
    }
}