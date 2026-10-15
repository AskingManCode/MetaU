namespace MicroservicioFacturacion.Entities
{
    public class FacturacionRequest
    {
        public string EstudianteIdentificacion { get; set; } = null!;
        public decimal Monto { get; set; }
        public Guid PeriodoID { get; set; }
    }
}