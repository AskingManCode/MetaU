namespace MicroservicioFacturacion.Services.Clients
{
    public interface IPeriodoServiceClient
    {
        Task<bool> ObtenerPorIdAsync(Guid periodoId, Guid usuarioId, string token);
    }
}