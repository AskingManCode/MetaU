using MicroservicioMatriculas.Entities;

namespace MicroservicioMatriculas.Services
{
    public interface IMatriculaService
    {
        Task<MatriculaResponse> Matricular(MatriculaRequest request, ContextoUsuario contexto);
        Task<MatriculaResponse> Modificar(int id, MatriculaRequest request, ContextoUsuario contexto);
        Task Eliminar(int id, ContextoUsuario contexto);
        Task<List<EstudianteMatriculadoResponse>> ObtenerEstudiantesMatriculados(
            string cursoCode, string grupoCode, ContextoUsuario contexto);

        Task<PaginaResultado<EstudianteMatriculadoResponse>> ObtenerEstudiantesMatriculadosPaginado(
            string cursoCode, string grupoCode, int pagina, ContextoUsuario contexto);
        Task<List<MatriculaResponse>> ObtenerMatriculasPorEstudiante(string identificacion, ContextoUsuario contexto);
        Task<PaginaResultado<MatriculaResponse>> ObtenerMatriculasPorEstudiantePaginado(
            string identificacion, int pagina, ContextoUsuario contexto);
    }
}