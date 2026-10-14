using MicroservicioPreMatriculas.Entities;

namespace MicroservicioPreMatriculas.Repository
{
    public interface IPrematriculaRepository
    {
        Task<Estudiante?> BuscarEstudiantePorIdentificacion(string identificacion);
        Task<Prematricula?> BuscarPorEstudianteCarreraPeriodo(Guid estudianteId, string carreraCode, Guid periodoId);
        Task<Prematricula?> BuscarPorId(Guid preMatriculaId);
        Task<List<Prematricula>> ListarActivas();
        Task CrearAsync(Prematricula prematricula);
        Task ActualizarAsync(Prematricula prematricula);
        Task EliminarAsync(Prematricula prematricula);
    }
}
