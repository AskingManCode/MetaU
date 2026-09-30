namespace MicroservicioNotas.Services
{
    public interface IGrupoClient
    {
        Task<GrupoInfo?> ObtenerPorCodigo(string grupoCode);
    }

    public record GrupoInfo(string GrupoCode, string CursoCode);
}
