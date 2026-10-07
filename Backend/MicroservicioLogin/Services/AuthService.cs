using System.Security.Claims;
using Microsoft.Extensions.Options;
using MicroservicioLogin.DTOs;
using MicroservicioLogin.Entities;
using MicroservicioLogin.Repository;

namespace MicroservicioLogin.Services
{
    // Orquesta login/refresh/validate. No conoce Dapper, JWT ni BCrypt
    // directamente, solo las interfaces (DIP).
    public class AuthService : IAuthService
    {
        private readonly IUsuarioRepository _usuarioRepository;
        private readonly IRefreshTokenRepository _refreshTokenRepository;
        private readonly IPasswordHasher _passwordHasher;
        private readonly IRefreshTokenHasher _refreshTokenHasher;
        private readonly ITokenService _tokenService;
        private readonly JwtOptions _opciones;

        public AuthService(
            IUsuarioRepository usuarioRepository,
            IRefreshTokenRepository refreshTokenRepository,
            IPasswordHasher passwordHasher,
            IRefreshTokenHasher refreshTokenHasher,
            ITokenService tokenService,
            IOptions<JwtOptions> opciones)
        {
            _usuarioRepository = usuarioRepository;
            _refreshTokenRepository = refreshTokenRepository;
            _passwordHasher = passwordHasher;
            _refreshTokenHasher = refreshTokenHasher;
            _tokenService = tokenService;
            _opciones = opciones.Value;
        }

        public async Task<LoginResponse?> LoginAsync(string email, string contrasena)
        {
            var usuario = await _usuarioRepository.ObtenerPorEmailAsync(email);
            if (usuario is null || !usuario.Estado || !_passwordHasher.Verify(contrasena, usuario.ContrasenaHash))
            {
                return null;
            }

            var (accessToken, expiracion) = _tokenService.GenerarAccessToken(usuario.UsuarioID, usuario.Email, usuario.RolCode);
            var refreshTokenTexto = _tokenService.GenerarRefreshToken();

            await _refreshTokenRepository.GuardarAsync(new RefreshToken
            {
                UsuarioID = usuario.UsuarioID,
                TokenHash = _refreshTokenHasher.Hash(refreshTokenTexto),
                FechaCreacion = DateTime.UtcNow,
                FechaExpiracion = DateTime.UtcNow.AddMinutes(_opciones.MinutosExpiracionRefreshToken),
                Revocado = false
            });

            return new LoginResponse
            {
                ExpiresIn = expiracion,
                AccessToken = accessToken,
                RefreshToken = refreshTokenTexto,
                UsuarioId = usuario.UsuarioID
            };
        }

        public async Task<RefreshResponse?> RefreshAsync(string refreshTokenTexto)
        {
            var hash = _refreshTokenHasher.Hash(refreshTokenTexto);
            var tokenGuardado = await _refreshTokenRepository.ObtenerVigentePorHashAsync(hash);
            if (tokenGuardado is null)
            {
                return null;
            }

            var usuario = await _usuarioRepository.ObtenerPorIdAsync(tokenGuardado.UsuarioID);
            if (usuario is null || !usuario.Estado)
            {
                return null;
            }

            // Rotacion: el refresh token usado se revoca y se entrega uno nuevo.
            await _refreshTokenRepository.RevocarAsync(tokenGuardado.RefreshTokenID);

            var (accessToken, expiracion) = _tokenService.GenerarAccessToken(usuario.UsuarioID, usuario.Email, usuario.RolCode);
            var nuevoRefreshTokenTexto = _tokenService.GenerarRefreshToken();

            await _refreshTokenRepository.GuardarAsync(new RefreshToken
            {
                UsuarioID = usuario.UsuarioID,
                TokenHash = _refreshTokenHasher.Hash(nuevoRefreshTokenTexto),
                FechaCreacion = DateTime.UtcNow,
                FechaExpiracion = DateTime.UtcNow.AddMinutes(_opciones.MinutosExpiracionRefreshToken),
                Revocado = false
            });

            return new RefreshResponse
            {
                ExpiresIn = expiracion,
                AccessToken = accessToken,
                RefreshToken = nuevoRefreshTokenTexto
            };
        }

        public ClaimsPrincipal? Validar(string accessToken) => _tokenService.ValidarAccessToken(accessToken);
    }
}
