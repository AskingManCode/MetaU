namespace MicroservicioPreMatriculas.Entities
{
    public class Estudiante
    {
        public Guid EstudianteID { get; set; }
        public string Identificacion { get; set; } = string.Empty;
        public string NombreCompleto { get; set; } = string.Empty;
        public bool Estado { get; set; }
    }
}
