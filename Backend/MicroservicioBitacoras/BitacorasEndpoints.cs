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

            if (!await authService.ValidarTokenAsync(token))
                return Results.Unauthorized();

            try
            {
                await service.RegistrarAsync(request);
                return Results.Ok();
            }
            catch (ArgumentException ex)
            {
                return Results.BadRequest(ex.Message);
            }
        }

        private static async Task<IResult> ObtenerTodosAsync(IBitacoraService service, IAuthServiceClient authService, HttpContext context)
        {
            var token = ObtenerToken(context);

            if (!await authService.ValidarTokenAsync(token))
                return Results.Unauthorized();

            var bitacoras = await service.ObtenerTodosAsync();
            return Results.Ok(bitacoras);
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