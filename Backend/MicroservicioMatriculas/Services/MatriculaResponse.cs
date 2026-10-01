namespace MicroservicioMatriculas.Services
{
    public record MatriculaResponse(
        int Id,
        Guid MatriculaID,
        string Identificacion,
        string CursoCode,
        string GrupoCode,
        Guid PeriodoID,
        string? Observaciones);
}
