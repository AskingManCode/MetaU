using System.Security.Claims;

namespace MicroservicioLogin.Services
{
    public interface ITokenService
    {
        (string token, DateTime expiresAt) GenerarAccessToken(Guid usuarioId, string email, string rolCode);
        string GenerarRefreshToken();
        ClaimsPrincipal? ValidarAccessToken(string token);
    }
}
