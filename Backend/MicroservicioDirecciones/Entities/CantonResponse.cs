namespace MicroservicioDirecciones.Entities
{
    public class CantonResponse
    {
        public Guid ProvinciaID { get; set; }
        public Guid CantonID { get; set; }
        public string Nombre { get; set; } = null!;
        public bool Estado { get; set; }
    }
}
