using System.Text.Json;
using MicroservicioInstituciones.Entities;
using MicroservicioInstituciones.Services;

namespace MicroservicioInstituciones
{
    public static class InstitucionesEndpoints
    {
        public static void MapInstitucionesEndpoints(this WebApplication app)
        {
            app.MapPost("/institucion", CrearAsync);
            app.MapPut("/institucion/{id}", ModificarAsync);
            app.MapDelete("/institucion/{id}", EliminarAsync);
            app.MapGet("/institucion", ObtenerTodosAsync);
            app.MapGet("/institucion/{id}", ObtenerPorIdAsync);
        }

        private static async Task<IResult> CrearAsync(
            Institucion institucion,
            IInstitucionService service,
            IAuthServiceClient authService,
            IBitacoraServiceClient bitacoraService,
            HttpContext context)
        {
            var auth = await AutorizarAsync(context, authService);
            if (auth.resultado != ResultadoAutorizacion.Autorizado)
                return RespuestaNoAutorizado(auth.resultado);

            try
            {
                await service.CrearAsync(institucion);
                await RegistrarBitacoraAsync(bitacoraService, auth.usuarioId, JsonSerializer.Serialize(institucion));
                return Results.Created($"/institucion/{institucion.InstitucionCode}", institucion);
            }
            catch (ArgumentException ex)
            {
                return Results.BadRequest(new { mensaje = ex.Message });
            }
            catch (ConflictoException ex)
            {
                return Results.Conflict(new { mensaje = ex.Message });
            }
            catch (Exception ex)
            {
                await RegistrarErrorAsync(bitacoraService, auth.usuarioId, "crear institucion", ex);
                return Results.Json(new { mensaje = "Error interno del servidor" }, statusCode: 500);
            }
        }

        private static async Task<IResult> ModificarAsync(
            string id,
            InstitucionUpdateRequest request,
            IInstitucionService service,
            IAuthServiceClient authService,
            IBitacoraServiceClient bitacoraService,
            HttpContext context)
        {
            var auth = await AutorizarAsync(context, authService);
            if (auth.resultado != ResultadoAutorizacion.Autorizado)
                return RespuestaNoAutorizado(auth.resultado);

            try
            {
                var anterior = await service.ObtenerPorIdAsync(id);
                if (anterior is null)
                    return Results.NotFound(new { mensaje = $"No existe una institucion activa con el identificador {id}" });

                var actualizo = await service.ActualizarAsync(id, request.Nombre);
                if (!actualizo)
                    return Results.NotFound(new { mensaje = $"No existe una institucion activa con el identificador {id}" });

                var actual = new Institucion { InstitucionCode = id, Nombre = request.Nombre, Estado = true };

                await RegistrarBitacoraAsync(bitacoraService, auth.usuarioId, JsonSerializer.Serialize(new { anterior, actual }));

                return Results.Ok(actual);
            }
            catch (ArgumentException ex)
            {
                return Results.BadRequest(new { mensaje = ex.Message });
            }
            catch (Exception ex)
            {
                await RegistrarErrorAsync(bitacoraService, auth.usuarioId, "modificar institucion", ex);
                return Results.Json(new { mensaje = "Error interno del servidor" }, statusCode: 500);
            }
        }

        private static async Task<IResult> EliminarAsync(
            string id,
            IInstitucionService service,
            IAuthServiceClient authService,
            IBitacoraServiceClient bitacoraService,
            HttpContext context)
        {
            var auth = await AutorizarAsync(context, authService);
            if (auth.resultado != ResultadoAutorizacion.Autorizado)
                return RespuestaNoAutorizado(auth.resultado);

            try
            {
                var institucion = await service.ObtenerPorIdAsync(id);
                if (institucion is null)
                    return Results.NotFound(new { mensaje = $"No existe una institucion activa con el identificador {id}" });

                await service.EliminarAsync(id);
                await RegistrarBitacoraAsync(bitacoraService, auth.usuarioId, JsonSerializer.Serialize(institucion));

                return Results.NoContent();
            }
            catch (Exception ex)
            {
                await RegistrarErrorAsync(bitacoraService, auth.usuarioId, "eliminar institucion", ex);
                return Results.Json(new { mensaje = "Error interno del servidor" }, statusCode: 500);
            }
        }

        private static async Task<IResult> ObtenerTodosAsync(
            IInstitucionService service,
            IAuthServiceClient authService,
            IBitacoraServiceClient bitacoraService,
            HttpContext context)
        {
            var auth = await AutorizarAsync(context, authService);
            if (auth.resultado != ResultadoAutorizacion.Autorizado)
                return RespuestaNoAutorizado(auth.resultado);

            try
            {
                var instituciones = await service.ObtenerTodosAsync();
                await RegistrarBitacoraAsync(bitacoraService, auth.usuarioId, "El usuario consulta instituciones");
                return Results.Ok(instituciones);
            }
            catch (Exception ex)
            {
                await RegistrarErrorAsync(bitacoraService, auth.usuarioId, "obtener instituciones", ex);
                return Results.Json(new { mensaje = "Error interno del servidor" }, statusCode: 500);
            }
        }

        private static async Task<IResult> ObtenerPorIdAsync(
            string id,
            IInstitucionService service,
            IAuthServiceClient authService,
            IBitacoraServiceClient bitacoraService,
            HttpContext context)
        {
            var auth = await AutorizarAsync(context, authService);
            if (auth.resultado != ResultadoAutorizacion.Autorizado)
                return RespuestaNoAutorizado(auth.resultado);

            try
            {
                var institucion = await service.ObtenerPorIdAsync(id);
                if (institucion is null)
                    return Results.NotFound(new { mensaje = $"No existe una institucion activa con el identificador {id}" });

                await RegistrarBitacoraAsync(bitacoraService, auth.usuarioId, $"El usuario consulta institucion {id}");
                return Results.Ok(institucion);
            }
            catch (Exception ex)
            {
                await RegistrarErrorAsync(bitacoraService, auth.usuarioId, "obtener institucion por id", ex);
                return Results.Json(new { mensaje = "Error interno del servidor" }, statusCode: 500);
            }
        }

        private enum ResultadoAutorizacion { Autorizado, NoAutorizado, FaltaUsuario }

        // Igual al patron real de Bitacoras: token contra /validate de Login,
        // mas el header X-Usuario-Id (el JWT no se decodifica aca, no hay forma
        // de sacar de ahi quien es el usuario sin la clave secreta de Login).
        private static async Task<(ResultadoAutorizacion resultado, Guid usuarioId)> AutorizarAsync(
            HttpContext context, IAuthServiceClient authService)
        {
            var token = ObtenerToken(context);
            if (string.IsNullOrWhiteSpace(token) || !await authService.ValidarTokenAsync(token))
                return (ResultadoAutorizacion.NoAutorizado, Guid.Empty);

            if (!Guid.TryParse(context.Request.Headers["X-Usuario-Id"], out var usuarioId))
                return (ResultadoAutorizacion.FaltaUsuario, Guid.Empty);

            return (ResultadoAutorizacion.Autorizado, usuarioId);
        }

        private static IResult RespuestaNoAutorizado(ResultadoAutorizacion resultado) =>
            resultado == ResultadoAutorizacion.FaltaUsuario
                ? Results.BadRequest(new { mensaje = "El usuario es requerido" })
                : Results.Unauthorized();

        private static string ObtenerToken(HttpContext context)
        {
            var authorization = context.Request.Headers.Authorization.ToString();
            if (!authorization.StartsWith("Bearer ", StringComparison.OrdinalIgnoreCase))
                return string.Empty;

            return authorization["Bearer ".Length..].Trim();
        }

        // Si Bitacoras no responde, no se cae la operacion principal por eso.
        private static async Task RegistrarBitacoraAsync(IBitacoraServiceClient bitacoraService, Guid usuarioId, string descripcion)
        {
            try
            {
                await bitacoraService.RegistrarAsync(usuarioId, descripcion);
            }
            catch
            {
            }
        }

        private static Task RegistrarErrorAsync(IBitacoraServiceClient bitacoraService, Guid usuarioId, string operacion, Exception ex) =>
            RegistrarBitacoraAsync(bitacoraService, usuarioId, $"Error tecnico en {operacion}: {ex.Message}");
    }
}
