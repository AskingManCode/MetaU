using Microsoft.AspNetCore.Mvc;
using MicroservicioLogin.Entities;
using MicroservicioLogin.Services;

namespace MicroservicioLogin
{
    public static class LoginEndpoints
    {
        public static void MapearEndpoints(this IEndpointRouteBuilder app)
        {
            app.MapPost("/login", LoginAsync)
                .WithName("Login");
            app.MapPost("/refresh", RefreshAsync)
                .WithName("RefreshToken");
            app.MapPost("/validate", Validate)
                .WithName("ValidateToken");
        }

        private static async Task<IResult> LoginAsync(
            [FromHeader(Name = "Email")] string? email,
            [FromHeader(Name = "Contrasena")] string? contrasena,
            IAuthService authService)
        {
            if (string.IsNullOrWhiteSpace(email) || string.IsNullOrWhiteSpace(contrasena))
            {
                return Results.Json(new { mensaje = "Correo y/o contraseña incorrectos" }, statusCode: StatusCodes.Status401Unauthorized);
            }

            var request = new LoginRequest { Email = email.Trim(), Contrasena = contrasena };
            var response = await authService.LoginAsync(request.Email, request.Contrasena);
            return response is null
                ? Results.Json(new { mensaje = "Correo y/o contraseña incorrectos" }, statusCode: StatusCodes.Status401Unauthorized)
                : Results.Json(response, statusCode: StatusCodes.Status201Created);
        }

        private static async Task<IResult> RefreshAsync(
            [FromHeader(Name = "RefreshToken")] string? refreshToken,
            IAuthService authService)
        {
            if (string.IsNullOrWhiteSpace(refreshToken))
            {
                return Results.Json(new { mensaje = "Refresh token inválido" }, statusCode: StatusCodes.Status401Unauthorized);
            }

            var response = await authService.RefreshAsync(refreshToken);
            return response is null
                ? Results.Json(new { mensaje = "Refresh token inválido" }, statusCode: StatusCodes.Status401Unauthorized)
                : Results.Ok(response);
        }

        private static IResult Validate(
            [FromHeader(Name = "Authorization")] string? authorization,
            IAuthService authService)
        {
            const string bearerPrefix = "Bearer ";
            if (authorization is null || !authorization.StartsWith(bearerPrefix, StringComparison.OrdinalIgnoreCase))
            {
                return Results.Unauthorized();
            }

            var token = authorization[bearerPrefix.Length..].Trim();
            return !string.IsNullOrWhiteSpace(token) && authService.Validar(token) is not null
                ? Results.Ok(true)
                : Results.Unauthorized();
        }
    }
}
