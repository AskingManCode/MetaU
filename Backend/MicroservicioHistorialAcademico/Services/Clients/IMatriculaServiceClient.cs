namespace MicroservicioHistorialAcademico.Services
{
    public interface IMatriculaServiceClient
    {
        Task<List<MatriculaResponse>> ObtenerPorEstudianteAsync(string identificacion, Guid usuario, string token);
    }

    public class MatriculaResponse
    {
        public int Id { get; set; }
        public Guid MatriculaID { get; set; }
        public string Identificacion { get; set; } = string.Empty;
        public string CursoCode { get; set; } = string.Empty;
        public string GrupoCode { get; set; } = string.Empty;
        public Guid PeriodoID { get; set; }
        public string? Observaciones { get; set; }
    }
}