namespace MicroservicioUsuarios.Entities
{
    public class Usuario
    {
        public Guid UsuarioId { get; set; }
        public string RolCode { get; set; } = null!;
        public string TipoIndentificacionCode { get; set; } = null!;
        public string Identificacion { get; set; } = null!;
        public string NombreCompleto { get; set; } = null!;
        public string Email { get; set; } = null!;
        public string ContrasenaHash { get; set; } = null!;
        public string Estado { get; set; } = null!;
    }
}
