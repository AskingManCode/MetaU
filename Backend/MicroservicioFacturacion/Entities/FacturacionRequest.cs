namespace MicroservicioFacturacion.Entities
{
    public class FacturacionRequest
    {
        public string IdentificacionEstudiante { get; set; } = null!;
        public decimal Monto { get; set; }
        public Guid? PeriodoID { get; set; }
    }
}
