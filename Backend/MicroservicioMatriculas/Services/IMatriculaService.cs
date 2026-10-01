namespace MicroservicioMatriculas.Services
{
    public interface IMatriculaService
    {
        Task<MatriculaResponse> Matricular(MatriculaRequest request, ContextoUsuario contexto);
        Task<MatriculaResponse> Modificar(int id, MatriculaRequest request, ContextoUsuario contexto);
        Task Eliminar(int id, ContextoUsuario contexto);
        Task<List<EstudianteMatriculadoResponse>> ObtenerEstudiantesMatriculados(
            string cursoCode, string grupoCode, ContextoUsuario contexto);
    }
}
