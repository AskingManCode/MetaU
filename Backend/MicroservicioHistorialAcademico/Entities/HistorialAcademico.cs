namespace MicroservicioHistorialAcademico.Entities
{
    public class HistorialAcademico
    {
        public string CodigoCurso { get; set; } = string.Empty;
        public string NombreCurso { get; set; } = string.Empty;
        public decimal Promedio { get; set; }
    }
}