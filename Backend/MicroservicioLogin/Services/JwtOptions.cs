namespace MicroservicioLogin.Services
{
    // Se llena desde appsettings.json (sección "Jwt") Si más adelante decidimos
    // traer estos valores desde MicroservicioParametros, solo cambiar de dónde
    // se llena esta clase — AuthService y JwtTokenService no se tocan
    public class JwtOptions
    {
        public string ClaveSecreta { get; set; } = string.Empty;
        public string Issuer { get; set; } = string.Empty;
        public string Audience { get; set; } = string.Empty;
        public int MinutosExpiracionAccessToken { get; set; } = 5;
        public int MinutosExpiracionRefreshToken { get; set; } = 60;
    }
}
