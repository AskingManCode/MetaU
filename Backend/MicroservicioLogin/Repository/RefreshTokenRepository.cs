using Dapper;
using MicroservicioLogin.Database;
using MicroservicioLogin.Entities;

namespace MicroservicioLogin.Repository
{
    public class RefreshTokenRepository : IRefreshTokenRepository
    {
        private readonly IDbConnectionFactory _conexiones;

        public RefreshTokenRepository(IDbConnectionFactory conexiones)
        {
            _conexiones = conexiones;
        }

        public async Task GuardarAsync(RefreshToken refreshToken)
        {
            const string sql = @"
                INSERT INTO RefreshToken (UsuarioID, TokenHash, Revocado, FechaCreacion, FechaExpiracion)
                VALUES (@UsuarioID, @TokenHash, @Revocado, @FechaCreacion, @FechaExpiracion)";

            using var conexion = _conexiones.CrearConexion();
            await conexion.ExecuteAsync(sql, refreshToken);
        }

        public async Task<RefreshToken?> ObtenerVigentePorHashAsync(string tokenHash)
        {
            const string sql = @"
                SELECT RefreshTokenID, UsuarioID, TokenHash, Revocado, FechaCreacion, FechaExpiracion
                FROM RefreshToken
                WHERE TokenHash = @TokenHash
                  AND Revocado = 0
                  AND FechaExpiracion > SYSDATETIME()";

            using var conexion = _conexiones.CrearConexion();
            return await conexion.QuerySingleOrDefaultAsync<RefreshToken>(sql, new { TokenHash = tokenHash });
        }

        public async Task RevocarAsync(int refreshTokenId)
        {
            const string sql = @"
                UPDATE RefreshToken
                SET Revocado = 1
                WHERE RefreshTokenID = @RefreshTokenId";

            using var conexion = _conexiones.CrearConexion();
            await conexion.ExecuteAsync(sql, new { RefreshTokenId = refreshTokenId });
        }
    }
}
