namespace MicroservicioExpedientesEstudiantes.Entities
{
    public class Estudiante
    {
        public string Identificacion { get; set; } = string.Empty;
        public string TipoIdentificacion { get; set; } = string.Empty;
        public string Email { get; set; } = string.Empty;
        public string NombreCompleto { get; set; } = string.Empty;
        public DateOnly FechaNacimiento { get; set; }
        public Direccion Direccion { get; set; } = new();

        public List<Telefono> Telefonos { get; set; } = new();
    }
}
