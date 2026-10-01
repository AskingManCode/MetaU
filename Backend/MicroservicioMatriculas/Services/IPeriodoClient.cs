namespace MicroservicioMatriculas.Services
{
    public interface IPeriodoClient
    {
        Task<PeriodoInfo?> ObtenerPorId(Guid periodoId, ContextoUsuario contexto);
    }

    public record PeriodoInfo(Guid PeriodoID, DateOnly FechaInicio, DateOnly FechaFin);
}
