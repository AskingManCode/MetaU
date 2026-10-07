namespace MicroservicioPreMatriculas.Services
{
    public record PrematriculaResponse(
        Guid Id,
        string Identificacion,
        string CarreraCode,
        List<string> Cursos,
        string? Observaciones,
        Guid PeriodoID);
}
