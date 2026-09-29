using Microsoft.EntityFrameworkCore;
using MicroservicioLogin.Entities;

namespace MicroservicioLogin.Repository
{
    public class RefreshTokenRepository : IRefreshTokenRepository
    {
        private readonly LoginDbContext _contexto;

        public RefreshTokenRepository(LoginDbContext contexto)
        {
            _contexto = contexto;
        }

        public async Task GuardarAsync(RefreshToken refreshToken)
        {
            _contexto.RefreshTokens.Add(refreshToken);
            await _contexto.SaveChangesAsync();
        }

        public async Task<RefreshToken?> ObtenerVigentePorTokenAsync(string token)
        {
            return await _contexto.RefreshTokens
                .FirstOrDefaultAsync(rt => rt.Token == token
                    && !rt.Revocado
                    && rt.FechaExpiracion > DateTime.UtcNow);
        }

        public async Task RevocarAsync(RefreshToken refreshToken)
        {
            refreshToken.Revocado = true;
            await _contexto.SaveChangesAsync();
        }
    }
}
