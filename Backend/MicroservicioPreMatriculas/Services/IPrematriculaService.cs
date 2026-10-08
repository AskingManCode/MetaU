namespace MicroservicioPreMatriculas.Services
{
    public interface IPrematriculaService
    {
        Task<PrematriculaResponse> Prematricular(PrematriculaRequest request, ContextoUsuario contexto);
        Task<PrematriculaResponse> Modificar(Guid id, PrematriculaRequest request, ContextoUsuario contexto);
        Task Eliminar(Guid id, ContextoUsuario contexto);
        Task<List<PrematriculaResponse>> ObtenerTodas(ContextoUsuario contexto);
        Task<PrematriculaResponse> ObtenerPorId(Guid id, ContextoUsuario contexto);
    }
}
