namespace MicroservicioNotas.Entities
{
    public class NotaRubro
    {
        public int NotaXEstudianteID { get; set; }
        public Guid RubroID { get; set; }
        public Guid EstudianteID { get; set; }
        public decimal Nota { get; set; }
        public DateOnly FechaRegistro { get; set; } = DateOnly.FromDateTime(DateTime.UtcNow);
    }
}
