namespace MicroservicioLogin.Entities
{
    public class RefreshToken
    {
        public int RefreshTokenID { get; set; }
        public Guid UsuarioID { get; set; }
        public string TokenHash { get; set; } = string.Empty;
        public bool Revocado { get; set; }
        public DateTime FechaCreacion { get; set; }
        public DateTime FechaExpiracion { get; set; }
    }
}
