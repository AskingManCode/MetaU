using System.Security.Claims;

namespace MicroservicioLogin.Services
{
    public interface ITokenService
    {
        (string token, DateTime expiresAt) GenerarAccessToken(int usuarioId, string email, string rol);
        string GenerarRefreshToken();
        ClaimsPrincipal? ValidarAccessToken(string token);
    }
}
