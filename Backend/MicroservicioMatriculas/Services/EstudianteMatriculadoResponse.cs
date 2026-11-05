namespace MicroservicioMatriculas.Services
{
    public record EstudianteMatriculadoResponse(
        string Identificacion,
        string TipoIdentificacion,
        string NombreCompleto,
        string Email);
}
