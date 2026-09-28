namespace MicroservicioExpedientesEstudiantes.Services
{
    public class EstudianteRequest
    {
        public string Identificacion { get; set; } = string.Empty;
        public string TipoIdentificacion { get; set; } = string.Empty;
        public string Email { get; set; } = string.Empty;
        public string NombreCompleto { get; set; } = string.Empty;
        public DateOnly FechaNacimiento { get; set; }
        public string Provincia { get; set; } = string.Empty;
        public string Canton { get; set; } = string.Empty;
        public string Distrito { get; set; } = string.Empty;
        public string OtrasSenas { get; set; } = string.Empty;
        public List<string> Telefonos { get; set; } = new();
    }
}
