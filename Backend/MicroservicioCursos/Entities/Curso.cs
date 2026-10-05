namespace MicroservicioCursos.Entities
{
    public class Curso
    {
        public string CursoCode { get; set; } = string.Empty;
        public string CarreraCode { get; set; } = string.Empty;
        public string Nombre { get; set; } = string.Empty;
        public byte Nivel { get; set; }
        public bool Estado { get; set; }
    }
}