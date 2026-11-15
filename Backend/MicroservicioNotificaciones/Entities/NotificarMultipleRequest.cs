namespace MicroservicioNotificaciones.Entities
{
    public class NotificarMultipleRequest
    {
        public List<string> Emails { get; set; } = new();
        public string Asunto { get; set; } = null!;
        public string Cuerpo { get; set; } = null!;
    }
}
