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

        private static async Task<IResult> RegistrarAsync(
            BitacoraRequest request,
            IBitacoraService service,
            IAuthServiceClient authService,
            HttpContext context)
        {
            var token = ObtenerToken(context);

            if (string.IsNullOrWhiteSpace(token) ||
                !await authService.ValidarTokenAsync(token))
                return Results.Unauthorized();

            if (!Guid.TryParse(context.Request.Headers["X-Usuario-Id"], out var usuario))
                return Results.BadRequest(new { mensaje = "El usuario es requerido" });

            try
            {
                request.Usuario = usuario;
                await service.RegistrarAsync(request);

                return Results.Created("/bitacora",
                    new { mensaje = "Bitacora registrada correctamente" });
            }
            catch (ArgumentException ex)
            {
                return Results.BadRequest(new { mensaje = ex.Message });
            }
            catch
            {
                return Results.Json(
                    new { mensaje = "Error interno del servidor" },
                    statusCode: 500);
            }
        }

        private static async Task<IResult> ObtenerTodosAsync(
            int? pagina,
            IBitacoraService service,
            IAuthServiceClient authService,
            HttpContext context)
        {
            var token = ObtenerToken(context);

            if (string.IsNullOrWhiteSpace(token) ||
                !await authService.ValidarTokenAsync(token))
                return Results.Unauthorized();

            try
            {
                if (pagina.HasValue)
                {
                    if (pagina.Value < 1)
                        return Results.BadRequest(new
                        {
                            mensaje = "La pagina debe ser mayor o igual a 1"
                        });

                    if (!Guid.TryParse(
                        context.Request.Headers["X-Usuario-Id"],
                        out var usuario) || usuario == Guid.Empty)
                        return Results.BadRequest(new
                        {
                            mensaje = "El usuario es requerido"
                        });

                    var resultado = await service.ObtenerPaginadoAsync(
                        pagina.Value, usuario, token);

                    return Results.Ok(resultado);
                }

                var bitacoras = await service.ObtenerTodosAsync();
                return Results.Ok(bitacoras);
            }
            catch
            {
                return Results.Json(
                    new { mensaje = "Error interno del servidor" },
                    statusCode: 500);
            }
        }

        private static string ObtenerToken(HttpContext context)
        {
            var authorization =
                context.Request.Headers.Authorization.ToString();

            if (!authorization.StartsWith(
                "Bearer ", StringComparison.OrdinalIgnoreCase))
                return string.Empty;

            return authorization["Bearer ".Length..].Trim();
        }
    }
}