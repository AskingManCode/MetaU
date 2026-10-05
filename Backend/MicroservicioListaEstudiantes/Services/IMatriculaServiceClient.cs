namespace MicroservicioListaEstudiantes.Services
{
    public class EstudianteMatriculadoDto
    {
        public string Identificacion { get; set; } = null!;
        public string TipoIdentificacion { get; set; } = null!;
        public string NombreCompleto { get; set; } = null!;
        public string Email { get; set; } = null!;
    }

    public interface IMatriculaServiceClient
    {
        Task<IEnumerable<EstudianteMatriculadoDto>> ObtenerPorCursoYGrupoAsync(string cursoCode, string grupoCode, Guid usuarioId, string token);
    }
}