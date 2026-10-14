using MicroservicioMatriculas.Entities;

namespace MicroservicioMatriculas.Repository
{
    public interface IMatriculaRepository
    {
        Task<Estudiante?> BuscarEstudiantePorIdentificacion(string identificacion);
        Task<int> ContarMatriculadosEnGrupo(string grupoCode);
        Task<Matricula?> BuscarMatricula(Guid estudianteId, string carreraCode, Guid periodoId);
        Task<MatriculaXCurso?> BuscarCursoEnMatricula(Guid matriculaId, string cursoCode);
        Task<MatriculaXCurso?> BuscarCursoPorId(int matriculaXCursoId);
        Task CrearMatriculaAsync(Matricula matricula);
        Task AgregarCursoAsync(MatriculaXCurso curso);
        Task ActualizarCursoAsync(MatriculaXCurso curso);
        Task EliminarCursoAsync(MatriculaXCurso curso);
        Task<List<Estudiante>> ListarEstudiantesMatriculados(string cursoCode, string grupoCode);

        Task<List<MatriculaXCurso>> ListarCursosPorEstudiante(string identificacion);
    }
}
