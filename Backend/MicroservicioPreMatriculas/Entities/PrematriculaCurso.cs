namespace MicroservicioPreMatriculas.Entities
{
    public class PrematriculaCurso
    {
        public int PreMatriculaXCursoID { get; set; }
        public Guid PreMatriculaID { get; set; }
        public string CursoCode { get; set; } = string.Empty;
        public bool Estado { get; set; }

        public Prematricula Prematricula { get; set; } = null!;
    }
}
