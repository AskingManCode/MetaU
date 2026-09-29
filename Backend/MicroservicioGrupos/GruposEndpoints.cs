using MicroservicioGrupos.Entities;
using MicroservicioGrupos.Services;
using System.Text.Json;

namespace MicroservicioGrupos
{
    public static class GruposEndpoints
    {
        public static void MapGruposEndpoints(this WebApplication app)
        {
            app.MapPost("/grupo", CrearAsync);
            app.MapPut("/grupo/{idGrupo:int}", ModificarAsync);
            app.MapDelete("/grupo/{idGrupo:int}", EliminarAsync);
            app.MapGet("/grupo", ObtenerTodosAsync);
            app.MapGet("/grupo/{idGrupo:int}", ObtenerPorIdAsync);
        }

        private static async Task<IResult> CrearAsync(
            Grupo grupo,
            IGrupoService service,
            IAuthServiceClient authService,
            IBitacoraServiceClient bitacoraService,
            HttpContext context)
        {
            var acceso = await ValidarAccesoAsync(context, authService);

            if (acceso.Error != null)
                return acceso.Error;

            try
            {
                if (await service.ObtenerPorIdAsync(grupo.IdGrupo) is not null)
                    return Results.Conflict(new { mensaje = "El grupo ya existe" });

                await service.CrearAsync(grupo);

                await bitacoraService.RegistrarAsync(
                    acceso.Usuario,
                    JsonSerializer.Serialize(grupo),
                    acceso.Token);

                return Results.Created($"/grupo/{grupo.IdGrupo}", grupo);
            }
            catch (ArgumentException ex)
            {
                return Results.BadRequest(new { mensaje = ex.Message });
            }
            catch
            {
                await RegistrarErrorAsync(bitacoraService, acceso.Usuario, acceso.Token);
                return Results.Json(new { mensaje = "Error interno del servidor" }, statusCode: 500);
            }
        }

        private static async Task<IResult> ModificarAsync(
            int idGrupo,
            Grupo grupo,
            IGrupoService service,
            IAuthServiceClient authService,
            IBitacoraServiceClient bitacoraService,
            HttpContext context)
        {
            var acceso = await ValidarAccesoAsync(context, authService);

            if (acceso.Error != null)
                return acceso.Error;

            try
            {
                if (idGrupo != grupo.IdGrupo)
                    return Results.BadRequest(new { mensaje = "El identificador del grupo no coincide con la ruta" });

                var anterior = await service.ObtenerPorIdAsync(idGrupo);

                if (anterior is null)
                    return Results.NotFound(new { mensaje = "El grupo no existe" });

                await service.ModificarAsync(grupo);

                var descripcion =
                    $"Anterior: {JsonSerializer.Serialize(anterior)} " +
                    $"Actual: {JsonSerializer.Serialize(grupo)}";

                await bitacoraService.RegistrarAsync(
                    acceso.Usuario,
                    descripcion,
                    acceso.Token);

                return Results.Ok(grupo);
            }
            catch (ArgumentException ex)
            {
                return Results.BadRequest(new { mensaje = ex.Message });
            }
            catch
            {
                await RegistrarErrorAsync(bitacoraService, acceso.Usuario, acceso.Token);
                return Results.Json(new { mensaje = "Error interno del servidor" }, statusCode: 500);
            }
        }

        private static async Task<IResult> EliminarAsync(
            int idGrupo,
            IGrupoService service,
            IAuthServiceClient authService,
            IBitacoraServiceClient bitacoraService,
            HttpContext context)
        {
            var acceso = await ValidarAccesoAsync(context, authService);

            if (acceso.Error != null)
                return acceso.Error;

            try
            {
                var grupo = await service.ObtenerPorIdAsync(idGrupo);

                if (grupo is null)
                    return Results.NotFound(new { mensaje = "El grupo no existe" });

                await service.EliminarAsync(idGrupo);

                await bitacoraService.RegistrarAsync(
                    acceso.Usuario,
                    JsonSerializer.Serialize(grupo),
                    acceso.Token);

                return Results.Ok(grupo);
            }
            catch
            {
                await RegistrarErrorAsync(bitacoraService, acceso.Usuario, acceso.Token);
                return Results.Json(new { mensaje = "Error interno del servidor" }, statusCode: 500);
            }
        }

        private static async Task<IResult> ObtenerTodosAsync(
            IGrupoService service,
            IAuthServiceClient authService,
            IBitacoraServiceClient bitacoraService,
            HttpContext context)
        {
            var acceso = await ValidarAccesoAsync(context, authService);

            if (acceso.Error != null)
                return acceso.Error;

            try
            {
                var grupos = await service.ObtenerTodosAsync();

                await bitacoraService.RegistrarAsync(
                    acceso.Usuario,
                    "El usuario consulta grupos",
                    acceso.Token);

                return Results.Ok(grupos);
            }
            catch
            {
                await RegistrarErrorAsync(bitacoraService, acceso.Usuario, acceso.Token);
                return Results.Json(new { mensaje = "Error interno del servidor" }, statusCode: 500);
            }
        }

        private static async Task<IResult> ObtenerPorIdAsync(
            int idGrupo,
            IGrupoService service,
            IAuthServiceClient authService,
            IBitacoraServiceClient bitacoraService,
            HttpContext context)
        {
            var acceso = await ValidarAccesoAsync(context, authService);

            if (acceso.Error != null)
                return acceso.Error;

            try
            {
                var grupo = await service.ObtenerPorIdAsync(idGrupo);

                if (grupo is null)
                    return Results.NotFound(new { mensaje = "El grupo no existe" });

                await bitacoraService.RegistrarAsync(
                    acceso.Usuario,
                    "El usuario consulta grupo",
                    acceso.Token);

                return Results.Ok(grupo);
            }
            catch
            {
                await RegistrarErrorAsync(bitacoraService, acceso.Usuario, acceso.Token);
                return Results.Json(new { mensaje = "Error interno del servidor" }, statusCode: 500);
            }
        }

        private static async Task<(string Token, int Usuario, IResult? Error)> ValidarAccesoAsync(
            HttpContext context,
            IAuthServiceClient authService)
        {
            var authorization = context.Request.Headers.Authorization.ToString();

            if (!authorization.StartsWith("Bearer ", StringComparison.OrdinalIgnoreCase))
                return ("", 0, Results.Unauthorized());

            var token = authorization["Bearer ".Length..].Trim();

            if (string.IsNullOrWhiteSpace(token) || !await authService.ValidarTokenAsync(token))
                return ("", 0, Results.Unauthorized());

            if (!int.TryParse(context.Request.Headers["X-Usuario-Id"], out var usuario) || usuario <= 0)
                return ("", 0, Results.BadRequest(new { mensaje = "El usuario es requerido" }));

            return (token, usuario, null);
        }

        private static async Task RegistrarErrorAsync(
            IBitacoraServiceClient bitacoraService,
            int usuario,
            string token)
        {
            try
            {
                await bitacoraService.RegistrarAsync(
                    usuario,
                    "Error tecnico en administracion de grupos",
                    token);
            }
            catch
            {
            }
        }
    }
}