using System.Text.Json;
using MicroservicioCarreras.Entities;
using MicroservicioCarreras.Services;

namespace MicroservicioCarreras
{
    public static class CarrerasEndpoints
    {
        public static void MapCarrerasEndpoints(this WebApplication app)
        {
            app.MapPost("/carrera", CrearAsync);
            app.MapPut("/carrera/{id}", ModificarAsync);
            app.MapDelete("/carrera/{id}", EliminarAsync);
            app.MapGet("/carrera", ObtenerTodosAsync);
            app.MapGet("/carrera/{id}", ObtenerPorIdAsync);
            app.MapGet("/carrera/institucion/{institucionId}", ObtenerPorInstitucionAsync);
        }

        private static async Task<IResult> CrearAsync(
            Carrera carrera,
            ICarreraService service,
            IAuthServiceClient authService,
            IBitacoraServiceClient bitacoraService,
            HttpContext context)
        {
            var acceso = await AutorizarAsync(context, authService);
            if (acceso.Error != null)
                return acceso.Error;

            try
            {
                await service.CrearAsync(carrera);
                await RegistrarBitacoraAsync(bitacoraService, acceso.UsuarioId, acceso.Token, JsonSerializer.Serialize(carrera));
                return Results.Created($"/carrera/{carrera.CarreraCode}", carrera);
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
                await RegistrarErrorAsync(bitacoraService, acceso.UsuarioId, acceso.Token, "crear carrera", ex);
                return Results.Json(new { mensaje = "Error interno del servidor" }, statusCode: 500);
            }
        }

        private static async Task<IResult> ModificarAsync(
            string id,
            CarreraUpdateRequest request,
            ICarreraService service,
            IAuthServiceClient authService,
            IBitacoraServiceClient bitacoraService,
            HttpContext context)
        {
            var acceso = await AutorizarAsync(context, authService);
            if (acceso.Error != null)
                return acceso.Error;

            try
            {
                var anterior = await service.ObtenerPorIdAsync(id);
                if (anterior is null)
                    return Results.NotFound(new { mensaje = $"No existe una carrera activa con el identificador {id}" });

                var actualizo = await service.ActualizarAsync(id, request.Nombre, request.DirectorID);
                if (!actualizo)
                    return Results.NotFound(new { mensaje = $"No existe una carrera activa con el identificador {id}" });

                var actual = new Carrera
                {
                    CarreraCode = id,
                    InstitucionCode = anterior.InstitucionCode,
                    DirectorID = request.DirectorID,
                    Nombre = request.Nombre,
                    Estado = true
                };

                await RegistrarBitacoraAsync(bitacoraService, acceso.UsuarioId, acceso.Token,
                    JsonSerializer.Serialize(new { anterior, actual }));

                return Results.Ok(actual);
            }
            catch (ArgumentException ex)
            {
                return Results.BadRequest(new { mensaje = ex.Message });
            }
            catch (Exception ex)
            {
                await RegistrarErrorAsync(bitacoraService, acceso.UsuarioId, acceso.Token, "modificar carrera", ex);
                return Results.Json(new { mensaje = "Error interno del servidor" }, statusCode: 500);
            }
        }

        private static async Task<IResult> EliminarAsync(
            string id,
            ICarreraService service,
            IAuthServiceClient authService,
            IBitacoraServiceClient bitacoraService,
            HttpContext context)
        {
            var acceso = await AutorizarAsync(context, authService);
            if (acceso.Error != null)
                return acceso.Error;

            try
            {
                var carrera = await service.ObtenerPorIdAsync(id);
                if (carrera is null)
                    return Results.NotFound(new { mensaje = $"No existe una carrera activa con el identificador {id}" });

                await service.EliminarAsync(id);
                await RegistrarBitacoraAsync(bitacoraService, acceso.UsuarioId, acceso.Token, JsonSerializer.Serialize(carrera));

                return Results.NoContent();
            }
            catch (Exception ex)
            {
                await RegistrarErrorAsync(bitacoraService, acceso.UsuarioId, acceso.Token, "eliminar carrera", ex);
                return Results.Json(new { mensaje = "Error interno del servidor" }, statusCode: 500);
            }
        }

        private static async Task<IResult> ObtenerTodosAsync(
            ICarreraService service,
            IAuthServiceClient authService,
            IBitacoraServiceClient bitacoraService,
            HttpContext context)
        {
            var acceso = await AutorizarAsync(context, authService);
            if (acceso.Error != null)
                return acceso.Error;

            try
            {
                var carreras = await service.ObtenerTodosAsync();
                await RegistrarBitacoraAsync(bitacoraService, acceso.UsuarioId, acceso.Token, "El usuario consulta carreras");
                return Results.Ok(carreras);
            }
            catch (Exception ex)
            {
                await RegistrarErrorAsync(bitacoraService, acceso.UsuarioId, acceso.Token, "obtener carreras", ex);
                return Results.Json(new { mensaje = "Error interno del servidor" }, statusCode: 500);
            }
        }

        private static async Task<IResult> ObtenerPorIdAsync(
            string id,
            ICarreraService service,
            IAuthServiceClient authService,
            IBitacoraServiceClient bitacoraService,
            HttpContext context)
        {
            var acceso = await AutorizarAsync(context, authService);
            if (acceso.Error != null)
                return acceso.Error;

            try
            {
                var carrera = await service.ObtenerPorIdAsync(id);
                if (carrera is null)
                    return Results.NotFound(new { mensaje = $"No existe una carrera activa con el identificador {id}" });

                await RegistrarBitacoraAsync(bitacoraService, acceso.UsuarioId, acceso.Token, $"El usuario consulta carrera {id}");
                return Results.Ok(carrera);
            }
            catch (Exception ex)
            {
                await RegistrarErrorAsync(bitacoraService, acceso.UsuarioId, acceso.Token, "obtener carrera por id", ex);
                return Results.Json(new { mensaje = "Error interno del servidor" }, statusCode: 500);
            }
        }

        private static async Task<IResult> ObtenerPorInstitucionAsync(
            string institucionId,
            ICarreraService service,
            IAuthServiceClient authService,
            IBitacoraServiceClient bitacoraService,
            HttpContext context)
        {
            var acceso = await AutorizarAsync(context, authService);
            if (acceso.Error != null)
                return acceso.Error;

            try
            {
                var carreras = await service.ObtenerPorInstitucionAsync(institucionId);
                await RegistrarBitacoraAsync(bitacoraService, acceso.UsuarioId, acceso.Token,
                    $"El usuario consulta carreras de la institucion {institucionId}");
                return Results.Ok(carreras);
            }
            catch (Exception ex)
            {
                await RegistrarErrorAsync(bitacoraService, acceso.UsuarioId, acceso.Token, "obtener carreras por institucion", ex);
                return Results.Json(new { mensaje = "Error interno del servidor" }, statusCode: 500);
            }
        }

        private enum ResultadoAutorizacion { Autorizado, NoAutorizado, FaltaUsuario }

        private static async Task<(ResultadoAutorizacion Resultado, Guid UsuarioId, string Token, IResult? Error)> AutorizarAsync(
            HttpContext context, IAuthServiceClient authService)
        {
            var token = ObtenerToken(context);
            if (string.IsNullOrWhiteSpace(token) || !await authService.ValidarTokenAsync(token))
                return (ResultadoAutorizacion.NoAutorizado, Guid.Empty, string.Empty, Results.Unauthorized());

            if (!Guid.TryParse(context.Request.Headers["X-Usuario-Id"], out var usuarioId))
                return (ResultadoAutorizacion.FaltaUsuario, Guid.Empty, string.Empty,
                    Results.BadRequest(new { mensaje = "El usuario es requerido" }));

            return (ResultadoAutorizacion.Autorizado, usuarioId, token, null);
        }

        private static string ObtenerToken(HttpContext context)
        {
            var authorization = context.Request.Headers.Authorization.ToString();
            if (!authorization.StartsWith("Bearer ", StringComparison.OrdinalIgnoreCase))
                return string.Empty;

            return authorization["Bearer ".Length..].Trim();
        }

        private static async Task RegistrarBitacoraAsync(IBitacoraServiceClient bitacoraService, Guid usuarioId, string token, string descripcion)
        {
            try
            {
                await bitacoraService.RegistrarAsync(usuarioId, descripcion, token);
            }
            catch
            {
                // Si Bitacoras no responde, no se cae la operacion principal por eso.
            }
        }

        private static Task RegistrarErrorAsync(IBitacoraServiceClient bitacoraService, Guid usuarioId, string token, string operacion, Exception ex) =>
            RegistrarBitacoraAsync(bitacoraService, usuarioId, token, $"Error tecnico en {operacion}: {ex.Message}");
    }
}
