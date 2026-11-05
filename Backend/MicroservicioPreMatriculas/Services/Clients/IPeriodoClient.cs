namespace MicroservicioPreMatriculas.Services
{
    public interface IPeriodoClient
    {
        Task<PeriodoInfo?> ObtenerPorId(Guid periodoId, ContextoUsuario contexto);
    }

    public record PeriodoInfo(Guid PeriodoID, DateTime FechaInicio, DateTime FechaFin);
}
