namespace MicroservicioLogin.Entities
{
    public sealed class LoginRequest
    {
        public string Email { get; set; } = string.Empty;
        public string Contrasena { get; set; } = string.Empty;
    }

    public sealed class LoginResponse
    {
        public DateTime ExpiresIn { get; set; }
        public string AccessToken { get; set; } = string.Empty;
        public string RefreshToken { get; set; } = string.Empty;
        public int UsuarioId { get; set; }
    }

    public sealed class RefreshResponse
    {
        public DateTime ExpiresIn { get; set; }
        public string AccessToken { get; set; } = string.Empty;
        public string RefreshToken { get; set; } = string.Empty;
    }
}
