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
        private readonly ILogger<AuthService> _logger;

        public AuthService(
            IUsuarioRepository usuarioRepository,
            IRefreshTokenRepository refreshTokenRepository,
            IPasswordHasher passwordHasher,
            IRefreshTokenHasher refreshTokenHasher,
            ITokenService tokenService,
            IOptions<JwtOptions> opciones,
            ILogger<AuthService> logger)
        {
            _usuarioRepository = usuarioRepository;
            _refreshTokenRepository = refreshTokenRepository;
            _passwordHasher = passwordHasher;
            _refreshTokenHasher = refreshTokenHasher;
            _tokenService = tokenService;
            _opciones = opciones.Value;
            _logger = logger;
        }

        public async Task<LoginResponse?> LoginAsync(string? email, string? contrasena)
        {
            if (string.IsNullOrWhiteSpace(email) || string.IsNullOrWhiteSpace(contrasena))
            {
                LogLoginFailure(null, "No se proporcionaron credenciales.");
                return null;
            }

            var usuario = await _usuarioRepository.ObtenerPorEmailAsync(email);
            if (usuario is null)
            {
                LogLoginFailure(null, "No se encontró un usuario para las credenciales proporcionadas.");
                return null;
            }

            if (!usuario.Estado)
            {
                LogLoginFailure(usuario.UsuarioID, "El usuario está inactivo.");
                return null;
            }

            if (!_passwordHasher.Verify(contrasena, usuario.ContrasenaHash))
            {
                LogLoginFailure(usuario.UsuarioID, "La contraseña no es válida.");
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

        private void LogLoginFailure(Guid? usuarioId, string descripcion)
        {
            _logger.LogWarning(
                "Intento de inicio de sesión fallido. FechaUtc: {FechaUtc}; UsuarioId: {UsuarioId}; Descripción: {Descripcion}",
                DateTimeOffset.UtcNow,
                usuarioId,
                descripcion);
        }

        public async Task<RefreshResponse?> RefreshAsync(string? refreshTokenTexto)
        {
            if (string.IsNullOrWhiteSpace(refreshTokenTexto))
                return null;

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

        public ClaimsPrincipal? Validar(string? authorization)
        {
            var token = ExtraerTokenDeHeader(authorization);
            return token is null ? null : _tokenService.ValidarAccessToken(token);
        }

        private static string? ExtraerTokenDeHeader(string? headerAutorizacion)
        {
            if (string.IsNullOrWhiteSpace(headerAutorizacion))
                return null;

            const string prefijo = "Bearer ";
            return headerAutorizacion.StartsWith(prefijo, StringComparison.OrdinalIgnoreCase)
                ? headerAutorizacion[prefijo.Length..]
                : headerAutorizacion;
        }
    }
}
