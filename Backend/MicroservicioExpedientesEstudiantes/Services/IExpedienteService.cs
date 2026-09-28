using MicroservicioExpedientesEstudiantes.Entities;

namespace MicroservicioExpedientesEstudiantes.Services
{
    public interface IExpedienteService
    {
        Task<Estudiante> Crear(EstudianteRequest request, string usuario);
        Task<Estudiante> Modificar(string identificacion, EstudianteRequest request, string usuario);
        Task Eliminar(string identificacion, string usuario);
        Task<List<Estudiante>> ObtenerTodos(string usuario);
        Task<Estudiante?> ObtenerPorId(string identificacion, string usuario);
    }
}
