namespace MicroservicioPreMatriculas.Services
{
    public class PrematriculaRequest
    {
        public string Identificacion { get; set; } = string.Empty;
        public string CarreraCode { get; set; } = string.Empty;
        public List<string> Cursos { get; set; } = new();
        public string? Observaciones { get; set; }
        public Guid PeriodoID { get; set; }
    }
}
