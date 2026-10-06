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

            if (string.IsNullOrWhiteSpace(tipoIdentificacion) || string.IsNullOrWhiteSpace(identificacion))
                return Results.BadRequest(new { mensaje = "El tipo y la identificacion son requeridos" });

            try
            {
                var historial = await service.ObtenerAsync(tipoIdentificacion, identificacion, acceso.Usuario, acceso.Token);

                await bitacora.RegistrarAsync(acceso.Usuario, "El usuario consulta historial academico", acceso.Token);

                return Results.Ok(historial);
            }
            catch (KeyNotFoundException ex)
            {
                return Results.NotFound(new { mensaje = ex.Message });
            }
            catch (Exception ex)
            {
                return Results.Problem(statusCode: 500, detail: ex.ToString());
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

            if (!Guid.TryParse(request.Headers["X-Usuario-Id"], out var usuario))
                return (false, string.Empty, Guid.Empty);

            return (true, token, usuario);
        }
    }
}