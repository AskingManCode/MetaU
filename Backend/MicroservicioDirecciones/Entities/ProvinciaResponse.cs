namespace MicroservicioDirecciones.Entities
{
    public class ProvinciaResponse
    {
        public Guid ProvinciaID { get; set; }
        public string Nombre { get; set; } = null!;
        public bool Estado { get; set; }
    }
}
