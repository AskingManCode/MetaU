namespace MicroservicioPreMatriculas.Services
{
    public interface ICursoClient
    {
        Task<CursoInfo?> ObtenerPorCodigo(string cursoCode, ContextoUsuario contexto);
    }

    public record CursoInfo(string CursoCode, string CarreraCode, int Nivel);
}
