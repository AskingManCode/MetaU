namespace MicroservicioInstituciones.Services
{
    public class UsuarioRequeridoException : Exception
    {
        public UsuarioRequeridoException() : base("El usuario es requerido") { }
    }
}
