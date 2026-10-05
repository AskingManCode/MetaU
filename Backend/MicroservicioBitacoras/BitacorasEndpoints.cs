using MicroservicioBitacoras.Entities;
using MicroservicioBitacoras.Services;

namespace MicroservicioBitacoras
{
    public static class BitacorasEndpoints
    {
        public static void MapBitacorasEndpoints(this WebApplication app)
        {
            app.MapPost("/bitacora", RegistrarAsync);
            app.MapGet("/bitacora", ObtenerTodosAsync);
        }

        private static async Task<IResult> RegistrarAsync(BitacoraRequest request, IBitacoraService service, IAuthServiceClient authService, HttpContext context)
        {
            var token = ObtenerToken(context);

            if (string.IsNullOrWhiteSpace(token) || !await authService.ValidarTokenAsync(token))
                return Results.Unauthorized();

            if (!Guid.TryParse(context.Request.Headers["X-Usuario-Id"], out var usuario))
                return Results.BadRequest(new { mensaje = "El usuario es requerido" });

            try
            {
                request.Usuario = usuario;
                await service.RegistrarAsync(request);
                return Results.Created("/bitacora", new { mensaje = "Bitacora registrada correctamente" });
            }
            catch (ArgumentException ex)
            {
                return Results.BadRequest(new { mensaje = ex.Message });
            }
            catch
            {
                return Results.Json(new { mensaje = "Error interno del servidor" }, statusCode: 500);
            }
        }

        private static async Task<IResult> ObtenerTodosAsync(IBitacoraService service, IAuthServiceClient authService, HttpContext context)
        {
            var token = ObtenerToken(context);

            if (string.IsNullOrWhiteSpace(token) || !await authService.ValidarTokenAsync(token))
                return Results.Unauthorized();

            try
            {
                var bitacoras = await service.ObtenerTodosAsync();
                return Results.Ok(bitacoras);
            }
            catch
            {
                return Results.Json(new { mensaje = "Error interno del servidor" }, statusCode: 500);
            }
        }

        private static string ObtenerToken(HttpContext context)
        {
            var authorization = context.Request.Headers.Authorization.ToString();

            if (!authorization.StartsWith("Bearer ", StringComparison.OrdinalIgnoreCase))
                return string.Empty;

            return authorization["Bearer ".Length..].Trim();
        }
    }
}