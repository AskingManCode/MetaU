namespace MicroservicioNotificaciones.Entities
{
    public class NotificarResponse
    {
        public string Email { get; set; } = null!;
        public string Asunto { get; set; } = null!;
        public string Estado { get; set; } = null!; // PENDIENTE, ENVIADO, ERROR, CANCELADO 
        public string? Mensaje { get; set; }
        public DateTime FechaEnvio { get; set; }
    }
}