using MicroservicioExpedientesEstudiantes.Entities;

namespace MicroservicioExpedientesEstudiantes.Services
{
    public interface IExpedienteService
    {
        Task<Estudiante> Crear(EstudianteRequest request, ContextoUsuario contexto);
        Task<Estudiante> Modificar(string identificacion, EstudianteRequest request, ContextoUsuario contexto);
        Task Eliminar(string identificacion, ContextoUsuario contexto);
        Task<List<Estudiante>> ObtenerTodos(ContextoUsuario contexto);
        Task<Estudiante?> ObtenerPorId(string identificacion, ContextoUsuario contexto);
    }
}
