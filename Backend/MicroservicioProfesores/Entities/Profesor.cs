namespace MicroservicioProfesores.Entities
{
    public class Profesor
    {
        public int ProfesorID { get; set; }
        public string TipoIdentificacionCode { get; set; } = string.Empty;
        public string Identificacion { get; set; } = string.Empty;
        public string Email { get; set; } = string.Empty;
        public string NombreCompleto { get; set; } = string.Empty;
        public DateTime FechaNacimiento { get; set; }
        public List<string> Telefonos { get; set; } = new();
    }
}