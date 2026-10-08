namespace MicroservicioFacturacion.Entities
{
    public class Factura
    {
        public Guid FacturaID { get; set; }
        public Guid EstudianteID { get; set; }
        public Guid MatriculaID { get; set; }
        public Guid PeriodoID { get; set; }
        public string Estado { get; set; } = null!;
        public DateTime FechaEmision { get; set; }
        public DateTime? FechaAnulacion { get; set; }
        public decimal Subtotal { get; set; }
        public decimal PorcentajeImpuesto { get; set; }
        public decimal Impuesto { get; set; }
        public decimal Total { get; set; }
        public int? DetalleFacturaID { get; set; }
        public string? Descripcion { get; set; }
        public string? CursoCode { get; set; }
        public decimal? MontoDetalle { get; set; }
    }
}
