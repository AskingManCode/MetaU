namespace MicroservicioMatriculas.Services
{
    public interface IGrupoClient
    {
        Task<GrupoInfo?> ObtenerPorCodigo(string grupoCode, ContextoUsuario contexto);
    }

    public record GrupoInfo(string GrupoCode, string CursoCode, int Cupo);
}
