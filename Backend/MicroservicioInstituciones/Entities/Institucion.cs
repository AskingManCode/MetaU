namespace MicroservicioInstituciones.Entities
{
    public class Institucion
    {
        public string InstitucionCode { get; set; } = string.Empty;
        public string Nombre { get; set; } = string.Empty;
        public bool Estado { get; set; } = true;
    }
}
