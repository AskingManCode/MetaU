namespace MicroservicioListaEstudiantes.Services.Clients
{
    public interface IPeriodoServiceClient
    {
        Task<bool> ExisteAsync(Guid periodoId, Guid usuarioId, string token);
    }
}