namespace MicroservicioBitacoras.Entities
{
    public class BitacoraRequest
    {
        public int Usuario { get; set; }
        public string Descripcion { get; set; } = string.Empty;
    }
}