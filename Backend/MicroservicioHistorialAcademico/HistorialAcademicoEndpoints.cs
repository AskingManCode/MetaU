using MicroservicioHistorialAcademico.Services;

namespace MicroservicioHistorialAcademico
{
    public static class HistorialAcademicoEndpoints
    {
        public static void MapHistorialAcademicoEndpoints(this WebApplication app)
        {
            app.MapGet("/historialacademico", ObtenerAsync);
        }

        private static async Task<IResult> ObtenerAsync(string? tipoIdentificacion, string? identificacion, HttpRequest request, IHistorialAcademicoService service, IAuthServiceClient auth, IBitacoraServiceClient bitacora)
        {
            var acceso = await ValidarAccesoAsync(request, auth);

            if (!acceso.Autorizado)
                return Results.Unauthorized();

            try
            {
                var historial = await service.ObtenerAsync(tipoIdentificacion, identificacion, acceso.Usuario, acceso.Token);
                await bitacora.RegistrarAsync(acceso.Usuario, "El usuario consulta historial academico", acceso.Token);

                return Results.Ok(historial);
            }
            catch (ArgumentException ex)
            {
                return Results.BadRequest(new { mensaje = ex.Message });
            }
            catch (KeyNotFoundException ex)
            {
                return Results.NotFound(new { mensaje = ex.Message });
            }
            catch (Exception ex)
            {
                await RegistrarErrorAsync(bitacora, acceso.Usuario, acceso.Token, ex);
                return Results.Json(new { mensaje = "Error interno del servidor" }, statusCode: 500);
            }
        }

        private static async Task<(bool Autorizado, string Token, Guid Usuario)> ValidarAccesoAsync(HttpRequest request, IAuthServiceClient auth)
        {
            var authorization = request.Headers.Authorization.ToString();

            if (!authorization.StartsWith("Bearer ", StringComparison.OrdinalIgnoreCase))
                return (false, string.Empty, Guid.Empty);

            var token = authorization["Bearer ".Length..].Trim();

            if (string.IsNullOrWhiteSpace(token) || !await auth.ValidarAsync(token))
                return (false, string.Empty, Guid.Empty);

            if (!Guid.TryParse(request.Headers["X-Usuario-Id"], out var usuario) || usuario == Guid.Empty)
                return (false, string.Empty, Guid.Empty);

            return (true, token, usuario);
        }

        private static async Task RegistrarErrorAsync(IBitacoraServiceClient bitacora, Guid usuario, string token, Exception ex)
        {
            try
            {
                await bitacora.RegistrarAsync(usuario, $"Error tecnico en historial academico: {ex.Message}", token);
            }
            catch
            {
            }
        }
    }
}