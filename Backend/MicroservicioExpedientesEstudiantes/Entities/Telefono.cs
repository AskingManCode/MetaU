namespace MicroservicioExpedientesEstudiantes.Entities
{
    public class Telefono
    {
        public int TelefonoXEstudiante { get; set; }
        public Guid EstudianteID { get; set; }
        public string Numero { get; set; } = string.Empty;
    }
}
