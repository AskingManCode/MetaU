namespace MicroservicioParametros.Entities
{
    public class ParametroResponse
    {
        public string ParametroCode { get; set; } = null!;
        public string Valor { get; set; } = null!;
        public bool Estado { get; set; }
    }
}