namespace MicroservicioPreMatriculas.Entities
{
    public class Prematricula
    {
        public Guid PreMatriculaID { get; set; }
        public Guid EstudianteID { get; set; }
        public string CarreraCode { get; set; } = string.Empty;
        public Guid PeriodoID { get; set; }
        public string? Observaciones { get; set; }
        public bool Estado { get; set; }

        public Estudiante Estudiante { get; set; } = null!;
        public List<PrematriculaCurso> Cursos { get; set; } = new();
    }
}
