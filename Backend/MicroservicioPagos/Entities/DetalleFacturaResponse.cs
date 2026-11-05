namespace MicroservicioPagos.Entities
{
    public class DetalleFacturaResponse
    {
        public int DetalleFacturaID { get; set; }
        public string Descripcion { get; set; } = null!;
        public string CursoCode { get; set; } = null!;
        public decimal Monto { get; set; }
    }
}
