namespace MicroservicioNotas.Services
{
    public class NotaRubroRequest
    {
        public int IdRubro { get; set; }
        public string Identificacion { get; set; } = string.Empty;
        public decimal Nota { get; set; }
    }
}
