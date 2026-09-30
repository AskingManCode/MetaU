namespace MicroservicioNotas.Entities
{
    public class NotaRubro
    {
        public int IdNota { get; set; }
        public int IdRubro { get; set; }
        public string Identificacion { get; set; } = string.Empty;
        public decimal Nota { get; set; }
    }
}
