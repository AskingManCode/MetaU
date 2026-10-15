namespace MicroservicioFacturacion.Entities
{
    public class MatriculaFacturacionResponse
    {
        public Guid MatriculaID { get; set; }
        public Guid PeriodoID { get; set; }
        public Guid EstudianteID { get; set; }
        public string CursoCode { get; set; } = null!;
        public string GrupoCode { get; set; } = null!;
    }
}