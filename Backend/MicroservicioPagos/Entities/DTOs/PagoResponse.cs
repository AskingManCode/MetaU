namespace MicroservicioPagos.Entities.DTOs
{
    public class PagoResponse
    {
        public Guid PagoID { get; set; }
        public Guid FacturaID { get; set; }
        public decimal Monto { get; set; }
        public DateTime FechaPago { get; set; }
        public DateTime? FechaReversion { get; set; }
        public string Estado { get; set; } = null!;
    }
}
