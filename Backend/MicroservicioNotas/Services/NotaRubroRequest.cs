namespace MicroservicioNotas.Services
{
    public class NotaRubroRequest
    {
        public Guid RubroID { get; set; }
        public string Identificacion { get; set; } = string.Empty;
        public decimal Nota { get; set; }
    }
}
