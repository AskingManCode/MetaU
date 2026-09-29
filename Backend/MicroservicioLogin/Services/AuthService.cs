using System.Security.Claims;
using Microsoft.Extensions.Options;
using MicroservicioLogin.Entities;
using MicroservicioLogin.Repository;

namespace MicroservicioLogin.Services
{
    // Orquesta login/refresh/validate. No sabe de EF Core, ni de JWT, ni de
    // BCrypt: solo coordina las abstracciones (DIP). Cambiar cualquiera de
    // esas piezas no obliga a tocar esta clase.
    public class AuthService : IAuthService
    {
        private readonly IUsuarioRepository _usuarioRepository;
        private readonly IRefreshTokenRepository _refreshTokenRepository;
        private readonly IPasswordHasher _passwordHasher;
        private readonly ITokenService _tokenService;
        private readonly JwtOptions _opciones;

        public AuthService(
            IUsuarioRepository usuarioRepository,
            IRefreshTokenRepository refreshTokenRepository,
            IPasswordHasher passwordHasher,
            ITokenService tokenService,
            IOptions<JwtOptions> opciones)
        {
            _usuarioRepository = usuarioRepository;
            _refreshTokenRepository = refreshTokenRepository;
            _passwordHasher = passwordHasher;
            _tokenService = tokenService;
            _opciones = opciones.Value;
        }

        public async Task<LoginResponse?> LoginAsync(string email, string contrasena)
        {
            var usuario = await _usuarioRepository.ObtenerPorEmailAsync(email);
            if (usuario is null || !usuario.Activo || !_passwordHasher.Verify(contrasena, usuario.ContrasenaHash))
            {
                return null;
            }

            var (accessToken, expiracion) = _tokenService.GenerarAccessToken(usuario.Id, usuario.Email, usuario.Rol);
            var refreshTokenTexto = _tokenService.GenerarRefreshToken();

            await _refreshTokenRepository.GuardarAsync(new RefreshToken
            {
                UsuarioId = usuario.Id,
                Token = refreshTokenTexto,
                FechaCreacion = DateTime.UtcNow,
                FechaExpiracion = DateTime.UtcNow.AddMinutes(_opciones.MinutosExpiracionRefreshToken),
                Revocado = false
            });

            return new LoginResponse
            {
                ExpiresIn = expiracion,
                AccessToken = accessToken,
                RefreshToken = refreshTokenTexto,
                UsuarioId = usuario.Id
            };
        }

        public async Task<RefreshResponse?> RefreshAsync(string refreshTokenTexto)
        {
            var tokenGuardado = await _refreshTokenRepository.ObtenerVigentePorTokenAsync(refreshTokenTexto);
            if (tokenGuardado is null)
            {
                return null;
            }

            var usuario = await _usuarioRepository.ObtenerPorIdAsync(tokenGuardado.UsuarioId);
            if (usuario is null)
            {
                return null;
            }

            if (!usuario.Activo)
            {
                await _refreshTokenRepository.RevocarAsync(tokenGuardado);
                return null;
            }

            // Rotación: el refresh token usado se revoca y se emite uno nuevo.
            await _refreshTokenRepository.RevocarAsync(tokenGuardado);

            var (accessToken, expiracion) = _tokenService.GenerarAccessToken(usuario.Id, usuario.Email, usuario.Rol);
            var nuevoRefreshTokenTexto = _tokenService.GenerarRefreshToken();

            await _refreshTokenRepository.GuardarAsync(new RefreshToken
            {
                UsuarioId = usuario.Id,
                Token = nuevoRefreshTokenTexto,
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
