namespace MicroservicioBitacoras.Entities
{
    public class Bitacora
    {
        public long IdBitacora { get; set; }
        public DateTime FechaBitacora { get; set; }
        public Guid Usuario { get; set; }
        public string Descripcion { get; set; } = string.Empty;
    }
}