namespace MicroservicioExpedientesEstudiantes.Services
{
    public class ValidacionException : Exception
    {
        public ValidacionException(string mensaje) : base(mensaje) { }
    }
}
