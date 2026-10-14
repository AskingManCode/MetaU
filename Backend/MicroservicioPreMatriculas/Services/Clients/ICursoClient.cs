namespace MicroservicioPreMatriculas.Services
{
    public interface ICursoClient
    {
        Task<CursoInfo?> ObtenerPorCodigo(string cursoCode, ContextoUsuario contexto);
    }

    public record CursoInfo(string CursoCode, int Nivel);
}
