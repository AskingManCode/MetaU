namespace MicroservicioBitacoras.Entities
{
    public class BitacoraRequest
    {
        public Guid Usuario { get; set; }
        public string Descripcion { get; set; } = string.Empty;
    }
}