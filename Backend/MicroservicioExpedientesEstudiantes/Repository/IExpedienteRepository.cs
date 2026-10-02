using MicroservicioExpedientesEstudiantes.Entities;

namespace MicroservicioExpedientesEstudiantes.Repository
{
    public interface IExpedienteRepository
    {
        Task<Estudiante> Insertar(Estudiante estudiante);
        Task<Estudiante?> Actualizar(Estudiante estudiante);
        Task<bool> Eliminar(string identificacion);
        Task<List<Estudiante>> ListarTodos();
        Task<Estudiante?> BuscarPorId(string identificacion);
        Task<bool> Existe(string identificacion);
        Task<bool> ExisteEmail(string email, string? identificacionExcluir = null);
    }
}
