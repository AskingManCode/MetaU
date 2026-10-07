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
        Task InsertarMatricula(Matricula matricula);
        Task InsertarCurso(MatriculaXCurso curso);
        Task GuardarCambios();
        Task<List<Estudiante>> ListarEstudiantesMatriculados(string cursoCode, string grupoCode);

        Task<List<MatriculaXCurso>> ListarCursosPorEstudiante(string identificacion);
    }
}