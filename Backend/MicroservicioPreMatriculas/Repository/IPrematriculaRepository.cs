using MicroservicioPreMatriculas.Entities;

namespace MicroservicioPreMatriculas.Repository
{
    public interface IPrematriculaRepository
    {
        Task<Estudiante?> BuscarEstudiantePorIdentificacion(string identificacion);
        Task<Prematricula?> BuscarPorEstudianteCarreraPeriodo(Guid estudianteId, string carreraCode, Guid periodoId);
        Task<Prematricula?> BuscarPorId(Guid preMatriculaId);
        Task<List<Prematricula>> ListarActivas();
        Task Insertar(Prematricula prematricula);
        Task GuardarCambios();
    }
}
