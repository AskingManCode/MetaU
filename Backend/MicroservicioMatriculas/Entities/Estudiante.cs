namespace MicroservicioMatriculas.Entities
{
    public class Estudiante
    {
        public Guid EstudianteID { get; set; }
        public string TipoIdentificacionCode { get; set; } = string.Empty;
        public string Identificacion { get; set; } = string.Empty;
        public string NombreCompleto { get; set; } = string.Empty;
        public string Email { get; set; } = string.Empty;
        public bool Estado { get; set; }
    }
}
