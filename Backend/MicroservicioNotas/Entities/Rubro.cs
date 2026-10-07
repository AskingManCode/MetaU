namespace MicroservicioNotas.Entities
{
    public class Rubro
    {
        public Guid RubroID { get; set; }
        public string GrupoCode { get; set; } = string.Empty;
        public string NombreRubro { get; set; } = string.Empty;
        public decimal Porcentaje { get; set; }
        public bool Bloqueado { get; set; } = true;
        public bool Estado { get; set; } = true;
    }
}
