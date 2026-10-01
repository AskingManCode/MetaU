namespace MicroservicioMatriculas.Entities
{
    public class Matricula
    {
        public Guid MatriculaID { get; set; }
        public Guid EstudianteID { get; set; }
        public string CarreraCode { get; set; } = string.Empty;
        public Guid PeriodoID { get; set; }
        public bool Estado { get; set; }

        public Estudiante Estudiante { get; set; } = null!;
        public List<MatriculaXCurso> Cursos { get; set; } = new();
    }
}
