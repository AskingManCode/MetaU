namespace MicroservicioFacturacion.Entities
{
    public class MatriculaFacturacionResponse
    {
        public Guid MatriculaID { get; set; }
        public Guid PeriodoID { get; set; }
        public string IdentificacionEstudiante { get; set; } = null!;
        public string CursoCode { get; set; } = null!;
        public string GrupoCode { get; set; } = null!;
    }
}