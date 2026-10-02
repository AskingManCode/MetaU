using System.IdentityModel.Tokens.Jwt;
using System.Security.Claims;
using System.Security.Cryptography;
using System.Text;
using Microsoft.Extensions.Options;
using Microsoft.IdentityModel.Tokens;

namespace MicroservicioLogin.Services
{
    public class JwtTokenService : ITokenService
    {
        private readonly JwtOptions _opciones;

        public JwtTokenService(IOptions<JwtOptions> opciones)
        {
            _opciones = opciones.Value;
        }

        public (string token, DateTime expiresAt) GenerarAccessToken(int usuarioId, string email, string rol)
        {
            var expiracion = DateTime.UtcNow.AddMinutes(_opciones.MinutosExpiracionAccessToken);

            var claims = new[]
            {
                new Claim(JwtRegisteredClaimNames.Sub, usuarioId.ToString()),
                new Claim(JwtRegisteredClaimNames.Email, email),
                new Claim(ClaimTypes.Role, rol),
                new Claim(JwtRegisteredClaimNames.Jti, Guid.NewGuid().ToString())
            };

            var llave = new SymmetricSecurityKey(Encoding.UTF8.GetBytes(_opciones.ClaveSecreta));
            var credenciales = new SigningCredentials(llave, SecurityAlgorithms.HmacSha256);

            var token = new JwtSecurityToken(
                issuer: _opciones.Issuer,
                audience: _opciones.Audience,
                claims: claims,
                expires: expiracion,
                signingCredentials: credenciales);

            return (new JwtSecurityTokenHandler().WriteToken(token), expiracion);
        }

        public string GenerarRefreshToken()
        {
            var bytes = new byte[64];
            RandomNumberGenerator.Fill(bytes);
            return Convert.ToBase64String(bytes);
        }

        public ClaimsPrincipal? ValidarAccessToken(string token)
        {
            var llave = new SymmetricSecurityKey(Encoding.UTF8.GetBytes(_opciones.ClaveSecreta));

            var parametros = new TokenValidationParameters
            {
                ValidateIssuer = true,
                ValidIssuer = _opciones.Issuer,
                ValidateAudience = true,
                ValidAudience = _opciones.Audience,
                ValidateLifetime = true,
                ValidateIssuerSigningKey = true,
                IssuerSigningKey = llave,
                ClockSkew = TimeSpan.Zero
            };

            try
            {
                return new JwtSecurityTokenHandler().ValidateToken(token, parametros, out _);
            }
            catch
            {
                return null;
            }
        }
    }
}
