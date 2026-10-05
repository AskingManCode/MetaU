using MicroservicioLogin.Entities;

namespace MicroservicioLogin.Repository
{
    public interface IRefreshTokenRepository
    {
        Task GuardarAsync(RefreshToken refreshToken);
        Task<RefreshToken?> ObtenerVigentePorHashAsync(string tokenHash);
        Task RevocarAsync(int refreshTokenId);
    }
}
