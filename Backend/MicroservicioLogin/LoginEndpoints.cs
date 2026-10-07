using Microsoft.AspNetCore.Mvc;
using MicroservicioLogin.DTOs;
using MicroservicioLogin.Services;

namespace MicroservicioLogin
{
    public static class LoginEndpoints
    {
        public static IEndpointRouteBuilder MapLoginEndpoints(this IEndpointRouteBuilder app)
        {
            app.MapPost("/login", LoginAsync);
            app.MapPost("/refresh", RefreshAsync);
            app.MapPost("/validate", ValidarAsync);

            return app;
        }

        private static async Task<IResult> LoginAsync(
            [FromHeader(Name = "usuario")] string? usuario,
            [FromHeader(Name = "contrasena")] string? contrasena,
            IAuthService authService)
        {
            if (string.IsNullOrWhiteSpace(usuario) || string.IsNullOrWhiteSpace(contrasena))
            {
                return Results.Json(
                    new ErrorResponse { Mensaje = "Usuario y/o contraseña incorrectos" },
                    statusCode: StatusCodes.Status401Unauthorized);
            }

            var respuesta = await authService.LoginAsync(usuario, contrasena);
            if (respuesta is null)
            {
                return Results.Json(
                    new ErrorResponse { Mensaje = "Usuario y/o contraseña incorrectos" },
                    statusCode: StatusCodes.Status401Unauthorized);
            }

            return Results.Json(respuesta, statusCode: StatusCodes.Status201Created);
        }

        private static async Task<IResult> RefreshAsync(RefreshRequest solicitud, IAuthService authService)
        {
            if (string.IsNullOrWhiteSpace(solicitud.RefreshToken))
            {
                return Results.Json(
                    new ErrorResponse { Mensaje = "No autorizado" },
                    statusCode: StatusCodes.Status401Unauthorized);
            }

            var respuesta = await authService.RefreshAsync(solicitud.RefreshToken);
            if (respuesta is null)
            {
                return Results.Json(
                    new ErrorResponse { Mensaje = "No autorizado" },
                    statusCode: StatusCodes.Status401Unauthorized);
            }

            return Results.Json(respuesta, statusCode: StatusCodes.Status201Created);
        }

        private static IResult ValidarAsync(
            [FromHeader(Name = "Authorization")] string? autorizacion,
            IAuthService authService)
        {
            var token = ExtraerTokenDeHeader(autorizacion);
            if (token is null)
            {
                return Results.StatusCode(StatusCodes.Status401Unauthorized);
            }

            var principal = authService.Validar(token);
            if (principal is null)
            {
                return Results.StatusCode(StatusCodes.Status401Unauthorized);
            }

            return Results.Json(true, statusCode: StatusCodes.Status200OK);
        }

        private static string? ExtraerTokenDeHeader(string? headerAutorizacion)
        {
            if (string.IsNullOrWhiteSpace(headerAutorizacion))
            {
                return null;
            }

            const string prefijo = "Bearer ";
            return headerAutorizacion.StartsWith(prefijo, StringComparison.OrdinalIgnoreCase)
                ? headerAutorizacion[prefijo.Length..]
                : headerAutorizacion;
        }
    }
}
