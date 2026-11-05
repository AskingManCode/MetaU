namespace MicroservicioPeriodos.Entities
{
    public class Periodo
    {
        public Guid PeriodoID { get; set; }
        public short Anio { get; set; }
        public int NumeroPeriodo { get; set; }
        public DateTime FechaInicio { get; set; }
        public DateTime FechaFin { get; set; }
        public bool Estado { get; set; }
    }
}