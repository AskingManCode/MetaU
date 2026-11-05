namespace MicroservicioPreMatriculas.Services
{
    public interface IBitacoraClient
    {
        Task Registrar(ContextoUsuario contexto, string descripcion);
    }
}