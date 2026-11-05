namespace MicroservicioNotificaciones.Entities
{
    public class NotificarRequest
    {
        public string Email { get; set; } = null!;
        public string Asunto { get; set; } = null!;
        public string Cuerpo { get; set; } = null!;
    }
}