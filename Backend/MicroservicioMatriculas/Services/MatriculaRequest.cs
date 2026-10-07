namespace MicroservicioMatriculas.Services
{
    public class MatriculaRequest
    {
        public string Identificacion { get; set; } = string.Empty;
        public string CursoCode { get; set; } = string.Empty;
        public string GrupoCode { get; set; } = string.Empty;
        public Guid PeriodoID { get; set; }
    }
}
