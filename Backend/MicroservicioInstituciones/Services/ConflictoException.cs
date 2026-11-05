namespace MicroservicioInstituciones.Services
{
    // Separado de ArgumentException para que el endpoint responda 409 y no 400.
    public class ConflictoException : Exception
    {
        public ConflictoException(string mensaje) : base(mensaje) { }
    }
}
