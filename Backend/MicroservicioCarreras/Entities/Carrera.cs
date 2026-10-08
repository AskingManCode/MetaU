namespace MicroservicioCarreras.Entities
{
    public class Carrera
    {
        public string CarreraCode { get; set; } = string.Empty;
        public string InstitucionCode { get; set; } = string.Empty;
        public Guid DirectorID { get; set; }
        public string Nombre { get; set; } = string.Empty;
        public bool Estado { get; set; } = true;
    }
}
