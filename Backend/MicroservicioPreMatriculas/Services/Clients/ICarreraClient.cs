namespace MicroservicioPreMatriculas.Services
{
    public interface ICarreraClient
    {
        Task<CarreraInfo?> ObtenerPorCodigo(string carreraCode, ContextoUsuario contexto);
    }

    public record CarreraInfo(string CarreraCode, string Nombre, bool Estado);
}
