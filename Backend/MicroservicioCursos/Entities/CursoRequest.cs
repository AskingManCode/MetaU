namespace MicroservicioCursos.Entities
{
    public class CursoRequest
    {
        public string CursoCode { get; set; } = string.Empty;
        public string CarreraCode { get; set; } = string.Empty;
        public string Nombre { get; set; } = string.Empty;
        public byte Nivel { get; set; }
    }
}
