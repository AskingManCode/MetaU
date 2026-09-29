using System.Security.Claims;
using MicroservicioLogin.Entities;

namespace MicroservicioLogin.Services
{
    public interface IAuthService
    {
        Task<LoginResponse?> LoginAsync(string email, string contrasena);
        Task<RefreshResponse?> RefreshAsync(string refreshToken);
        ClaimsPrincipal? Validar(string accessToken);
    }
}
