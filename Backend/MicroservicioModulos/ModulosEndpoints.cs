using MicroservicioModulos.Entities;
using MicroservicioModulos.Services;
using MicroservicioModulos.Services.Clients;
using Microsoft.AspNetCore.Mvc;
using System.Text.Json;

namespace MicroservicioModulos
{
    public static class ModulosEndpoints
    {
        public static void MapModuloEndpoints(this IEndpointRouteBuilder routes)
        {
            var group = routes
                .MapGroup("/modulo")
                .WithTags(nameof(Modulos))
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
                [FromServices] IModuloService moduloService,
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
                        var resultado = await moduloService.ObtenerPaginadoAsync(pagina.Value, usuarioId, ObtenerToken(request));
                        await bitacoraService.RegistrarAsync(usuarioId, "El usuario consulta modulos", ObtenerToken(request));
                        return Results.Ok(resultado);
                    }

                    var modulos = await moduloService.ObtenerTodosAsync();
                    await bitacoraService.RegistrarAsync(usuarioId, "El usuario consulta modulos", ObtenerToken(request));
                    return Results.Ok(modulos);
                });
            })
            .WithName("GetAllModulos")
            .WithOpenApi();

            // GET Obtener por id
            group.MapGet("/{id}", async (
                HttpRequest request,
                string id,
                [FromServices] IModuloService moduloService,
                [FromServices] IAuthServiceClient authService,
                [FromServices] IBitacoraServiceClient bitacoraService) =>
            {
                if (!await TokenValidoAsync(request, authService))
                    return Results.Unauthorized();

                if (!ObtenerUsuarioId(request, out var usuarioId))
                    return Results.BadRequest(new { message = "El usuario es requerido" });

                return await EjecutarAsync(async () =>
                {
                    var modulo = await moduloService.ObtenerPorIdAsync(id);
                    await bitacoraService.RegistrarAsync(usuarioId, "El usuario consulta modulo " + id, ObtenerToken(request));
                    return Results.Ok(modulo);
                });
            })
            .WithName("GetModuloById")
            .WithOpenApi();

            // POST
            group.MapPost("/", async (
                HttpRequest request,
                [FromBody] Modulos modulo,
                [FromServices] IModuloService moduloService,
                [FromServices] IAuthServiceClient authService,
                [FromServices] IBitacoraServiceClient bitacoraService) =>
            {
                if (!await TokenValidoAsync(request, authService))
                    return Results.Unauthorized();

                if (!ObtenerUsuarioId(request, out var usuarioId))
                    return Results.BadRequest(new { message = "El usuario es requerido" });

                return await EjecutarAsync(async () =>
                {
                    var creado = await moduloService.CrearAsync(modulo);
                    await bitacoraService.RegistrarAsync(usuarioId, JsonSerializer.Serialize(creado), ObtenerToken(request));
                    return Results.Created($"/modulo/{creado.IdModulo}", creado);
                });
            })
            .WithName("CreateModulo")
            .WithOpenApi();

            // PUT
            group.MapPut("/{id}", async (
                HttpRequest request,
                string id,
                [FromBody] Modulos modulo,
                [FromServices] IModuloService moduloService,
                [FromServices] IAuthServiceClient authService,
                [FromServices] IBitacoraServiceClient bitacoraService) =>
            {
                if (!await TokenValidoAsync(request, authService))
                    return Results.Unauthorized();

                if (!ObtenerUsuarioId(request, out var usuarioId))
                    return Results.BadRequest(new { message = "El usuario es requerido" });

                return await EjecutarAsync(async () =>
                {
                    var (anterior, actual) = await moduloService.ActualizarAsync(id, modulo);
                    var detalle = JsonSerializer.Serialize(new { anterior, actual });
                    await bitacoraService.RegistrarAsync(usuarioId, detalle, ObtenerToken(request));
                    return Results.Ok(actual);
                });
            })
            .WithName("UpdateModulo")
            .WithOpenApi();

            // DELETE
            group.MapDelete("/{id}", async (
                HttpRequest request,
                string id,
                [FromServices] IModuloService moduloService,
                [FromServices] IAuthServiceClient authService,
                [FromServices] IBitacoraServiceClient bitacoraService) =>
            {
                if (!await TokenValidoAsync(request, authService))
                    return Results.Unauthorized();

                if (!ObtenerUsuarioId(request, out var usuarioId))
                    return Results.BadRequest(new { message = "El usuario es requerido" });

                return await EjecutarAsync(async () =>
                {
                    var eliminado = await moduloService.EliminarAsync(id);
                    await bitacoraService.RegistrarAsync(usuarioId, JsonSerializer.Serialize(eliminado), ObtenerToken(request));
                    return Results.NoContent();
                });
            })
            .WithName("DeleteModulo")
            .WithOpenApi();
        }
    }
}