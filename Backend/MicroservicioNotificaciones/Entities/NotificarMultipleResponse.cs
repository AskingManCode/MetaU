namespace MicroservicioNotificaciones.Entities
{
    public class NotificarMultipleResponse
    {
        public int TotalEnviados { get; set; }
        public int TotalFallidos { get; set; }
        public List<NotificarResponse> Resultados { get; set; } = new();
    }
}
