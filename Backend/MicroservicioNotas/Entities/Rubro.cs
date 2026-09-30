namespace MicroservicioNotas.Entities
{
    public class Rubro
    {
        public int IdRubro { get; set; }
        public string GrupoCode { get; set; } = string.Empty;
        public string CursoCode { get; set; } = string.Empty;
        public string Nombre { get; set; } = string.Empty;
        public decimal Porcentaje { get; set; }
    }
}
