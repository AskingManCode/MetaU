namespace MicroservicioNotificaciones.Entities
{
    public class NotificacionHistorialResponse
    {
        public long NotificacionID { get; set; }
        public Guid UsuarioID { get; set; }
        public string EmailDestino { get; set; } = null!;
        public string PlantillaNotificacionCode { get; set; } = null!;
        public string? ParametrosJson { get; set; }
        public string? Asunto { get; set; }
        public string? Cuerpo { get; set; }
        public DateTime FechaCreacion { get; set; }
        public DateTime? FechaEnvio { get; set; }
        public string EstadoNotificacion { get; set; } = null!;
        public string? EstadoNombre { get; set; }
        public string? MensajeError { get; set; }
        public byte NumeroIntentos { get; set; }
        public DateTime? FechaUltimoIntento { get; set; }
    }
}
