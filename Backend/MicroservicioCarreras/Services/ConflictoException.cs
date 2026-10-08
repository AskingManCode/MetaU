namespace MicroservicioCarreras.Services
{
    public class ConflictoException : Exception
    {
        public ConflictoException(string mensaje) : base(mensaje) { }
    }
}
