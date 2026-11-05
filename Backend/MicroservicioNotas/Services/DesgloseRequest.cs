namespace MicroservicioNotas.Services
{
    public class DesgloseRequest
    {
        public string GrupoCode { get; set; } = string.Empty;
        public List<RubroItem> Rubros { get; set; } = new();
    }

    public class RubroItem
    {
        public string NombreRubro { get; set; } = string.Empty;
        public decimal Porcentaje { get; set; }
    }
}
