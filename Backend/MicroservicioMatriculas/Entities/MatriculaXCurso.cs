namespace MicroservicioMatriculas.Entities
{
    public class MatriculaXCurso
    {
        public int MatriculaXCursoID { get; set; }
        public Guid MatriculaID { get; set; }
        public string CursoCode { get; set; } = string.Empty;
        public string GrupoCode { get; set; } = string.Empty;
        public bool Estado { get; set; }

        public Matricula Matricula { get; set; } = null!;
    }
}
