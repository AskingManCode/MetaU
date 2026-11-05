namespace MicroservicioLogin.Entities
{

    public class Usuario
    {
        public Guid UsuarioID { get; set; }
        public string RolCode { get; set; } = string.Empty;
        public string Email { get; set; } = string.Empty;
        public string ContrasenaHash { get; set; } = string.Empty;
        public bool Estado { get; set; }
    }
}
