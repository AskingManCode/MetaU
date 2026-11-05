namespace MicroservicioPagos.Entities
{
    public class FacturaResponse
    {
        public Guid FacturaID { get; set; }
        public string IdentificacionEstudiante { get; set; } = null!;
        public Guid MatriculaID { get; set; }
        public Guid PeriodoID { get; set; }
        public string Estado { get; set; } = null!;
        public DateTime FechaEmision { get; set; }
        public DateTime? FechaAnulacion { get; set; }
        public decimal Subtotal { get; set; }
        public decimal PorcentajeImpuesto { get; set; }
        public decimal Impuesto { get; set; }
        public decimal Total { get; set; }
        public List<DetalleFacturaResponse> Detalles { get; set; } = [];
    }
}
