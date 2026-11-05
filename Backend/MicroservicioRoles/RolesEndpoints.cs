using MicroservicioRoles.Entities;
using MicroservicioRoles.Services;
using MicroservicioRoles.Services.Clients;
using Microsoft.AspNetCore.Mvc;
using System.Text.Json;

namespace MicroservicioRoles
{
    public static class RolesEndpoints
    {
        public static void MapRolEndpoints(this IEndpointRouteBuilder routes)
        {
            var group = routes
                .MapGroup("/rol")
                .WithTags(nameof(Rol))
                .RequireCors("ClientApps");

            string ObtenerToken(HttpRequest request) =>
              request.Headers.Authorization.ToString().Replace("Bearer ", "");

            async Task<bool> TokenValidoAsync(HttpRequest request, IAuthServiceClient authService)
                => await authService.ValidarAsync(ObtenerToken(request));

            bool ObtenerUsuarioId(HttpRequest request, out Guid usuarioId)
                => Guid.TryParse(request.Headers["X-Usuario-Id"], out usuarioId) && usuarioId != Guid.Empty;

            // Convierte las excepciones del service en respuestas HTTP
            async Task<IResult> EjecutarAsync(Func<Task<IResult>> accion)
            {
                try
                {
                    return await accion();
                }
                catch (ArgumentException ex)
                {
                    return Results.BadRequest(new { message = ex.Message });
                }
                catch (KeyNotFoundException ex)
                {
                    return Results.NotFound(new { message = ex.Message });
                }
                catch (InvalidOperationException ex)
                {
                    return Results.Conflict(new { message = ex.Message });
                }
            }

            // GET Obtener Todos
            group.MapGet("/", async (
                HttpRequest request,
                int? pagina,
                [FromServices] IRolService rolService,
                [FromServices] IAuthServiceClient authService,
                [FromServices] IBitacoraServiceClient bitacoraService) =>
            {
                if (!await TokenValidoAsync(request, authService))
                    return Results.Unauthorized();

                if (!ObtenerUsuarioId(request, out var usuarioId))
                    return Results.BadRequest(new { message = "El usuario es requerido" });

                return await EjecutarAsync(async () =>
                {
                    if (pagina.HasValue)
                    {
                        var resultado = await rolService.ObtenerPaginadoAsync(pagina.Value, usuarioId, ObtenerToken(request));
                        await bitacoraService.RegistrarAsync(usuarioId, "El usuario consulta roles", ObtenerToken(request));
                        return Results.Ok(resultado);
                    }

                    var roles = await rolService.ObtenerTodosAsync();
                    await bitacoraService.RegistrarAsync(usuarioId, "El usuario consulta roles", ObtenerToken(request));
                    return Results.Ok(roles);
                });
            })
            .WithName("GetAllRoles")
            .WithOpenApi();

            // GET Obtener por id
            group.MapGet("/{id}", async (
                HttpRequest request,
                string id,
                [FromServices] IRolService rolService,
                [FromServices] IAuthServiceClient authService,
                [FromServices] IBitacoraServiceClient bitacoraService) =>
            {
                if (!await TokenValidoAsync(request, authService))
                    return Results.Unauthorized();

                if (!ObtenerUsuarioId(request, out var usuarioId))
                    return Results.BadRequest(new { message = "El usuario es requerido" });

                return await EjecutarAsync(async () =>
                {
                    var rol = await rolService.ObtenerPorIdAsync(id);
                    await bitacoraService.RegistrarAsync(usuarioId, "El usuario consulta rol " + id, ObtenerToken(request));
                    return Results.Ok(rol);
                });
            })
            .WithName("GetRolById")
            .WithOpenApi();

            // POST
            group.MapPost("/", async (
                HttpRequest request,
                [FromBody] Rol rol,
                [FromServices] IRolService rolService,
                [FromServices] IAuthServiceClient authService,
                [FromServices] IBitacoraServiceClient bitacoraService) =>
            {
                if (!await TokenValidoAsync(request, authService))
                    return Results.Unauthorized();

                if (!ObtenerUsuarioId(request, out var usuarioId))
                    return Results.BadRequest(new { message = "El usuario es requerido" });

                return await EjecutarAsync(async () =>
                {
                    var creado = await rolService.CrearAsync(rol);
                    await bitacoraService.RegistrarAsync(usuarioId, JsonSerializer.Serialize(creado), ObtenerToken(request));
                    return Results.Created($"/rol/{creado.IdRol}", creado);
                });
            })
            .WithName("CreateRol")
            .WithOpenApi();

            // PUT
            group.MapPut("/{id}", async (
                HttpRequest request,
                string id,
                [FromBody] Rol rol,
                [FromServices] IRolService rolService,
                [FromServices] IAuthServiceClient authService,
                [FromServices] IBitacoraServiceClient bitacoraService) =>
            {
                if (!await TokenValidoAsync(request, authService))
                    return Results.Unauthorized();

                if (!ObtenerUsuarioId(request, out var usuarioId))
                    return Results.BadRequest(new { message = "El usuario es requerido" });

                return await EjecutarAsync(async () =>
                {
                    var (anterior, actual) = await rolService.ActualizarAsync(id, rol);
                    var detalle = JsonSerializer.Serialize(new { anterior, actual });
                    await bitacoraService.RegistrarAsync(usuarioId, detalle, ObtenerToken(request));
                    return Results.Ok(actual);
                });
            })
            .WithName("UpdateRol")
            .WithOpenApi();

            // DELETE
            group.MapDelete("/{id}", async (
                HttpRequest request,
                string id,
                [FromServices] IRolService rolService,
                [FromServices] IAuthServiceClient authService,
                [FromServices] IBitacoraServiceClient bitacoraService) =>
            {
                if (!await TokenValidoAsync(request, authService))
                    return Results.Unauthorized();

                if (!ObtenerUsuarioId(request, out var usuarioId))
                    return Results.BadRequest(new { message = "El usuario es requerido" });

                return await EjecutarAsync(async () =>
                {
                    var eliminado = await rolService.EliminarAsync(id);
                    await bitacoraService.RegistrarAsync(usuarioId, JsonSerializer.Serialize(eliminado), ObtenerToken(request));
                    return Results.NoContent();
                });
            })
            .WithName("DeleteRol")
            .WithOpenApi();

            // GET modulos por rol
            group.MapGet("/{id}/modulos", async (
                HttpRequest request,
                string id,
                [FromServices] IRolService rolService,
                [FromServices] IAuthServiceClient authService,
                [FromServices] IBitacoraServiceClient bitacoraService) =>
            {
                if (!await TokenValidoAsync(request, authService))
                    return Results.Unauthorized();

                if (!ObtenerUsuarioId(request, out var usuarioId))
                    return Results.BadRequest(new { message = "El usuario es requerido" });

                return await EjecutarAsync(async () =>
                {
                    var permisos = await rolService.ObtenerPermisosAsync(id);
                    await bitacoraService.RegistrarAsync(usuarioId, "El usuario consulta permisos del rol " + id, ObtenerToken(request));
                    return Results.Ok(permisos);
                });
            })
            .WithName("GetPermisosRol")
            .WithOpenApi();

            // PUT activar o descativar modulo para rol
            group.MapPut("/{id}/modulos", async (
                HttpRequest request,
                string id,
                [FromBody] List<RolModulo> permisos,
                [FromServices] IRolService rolService,
                [FromServices] IAuthServiceClient authService,
                [FromServices] IBitacoraServiceClient bitacoraService) =>
            {
                if (!await TokenValidoAsync(request, authService))
                    return Results.Unauthorized();

                if (!ObtenerUsuarioId(request, out var usuarioId))
                    return Results.BadRequest(new { message = "El usuario es requerido" });

                return await EjecutarAsync(async () =>
                {
                    var (anteriores, actuales) = await rolService.ActualizarPermisosAsync(id, permisos);
                    var detalle = JsonSerializer.Serialize(new { rol = id, anteriores, actuales });
                    await bitacoraService.RegistrarAsync(usuarioId, detalle, ObtenerToken(request));
                    return Results.Ok(actuales);
                });
            })
            .WithName("UpdatePermisosRol")
            .WithOpenApi();
        }
    }
}