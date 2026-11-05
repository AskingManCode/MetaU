namespace MicroservicioDirecciones.Entities
{
    public class DistritoResponse
    {
        public Guid ProvinciaID { get; set; }
        public Guid CantonID { get; set; }
        public Guid DistritoID { get; set; }
        public string Nombre { get; set; } = null!;
        public bool Estado { get; set; }
    }
}
