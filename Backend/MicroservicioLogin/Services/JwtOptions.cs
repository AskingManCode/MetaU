namespace MicroservicioLogin.Services
{
    // Se llena desde appsettings.json (seccion "Jwt"). Sigue pendiente si esto
    // debe leerse de la tabla de parametros de USR3 en vez de config local.
    public class JwtOptions
    {
        public string ClaveSecreta { get; set; } = string.Empty;
        public string Issuer { get; set; } = string.Empty;
        public string Audience { get; set; } = string.Empty;
        public int MinutosExpiracionAccessToken { get; set; } = 5;
        public int MinutosExpiracionRefreshToken { get; set; } = 60;
    }
}
