using MicroservicioLogin.Entities;

namespace MicroservicioLogin.Repository
{
    public interface IRefreshTokenRepository
    {
        Task GuardarAsync(RefreshToken refreshToken);
        Task<RefreshToken?> ObtenerVigentePorTokenAsync(string token);
        Task RevocarAsync(RefreshToken refreshToken);
    }
}
