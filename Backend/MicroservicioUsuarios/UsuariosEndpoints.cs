using MicroservicioUsuarios.Entities;
using MicroservicioUsuarios.Services;
using MicroservicioUsuarios.Services.Clients;
using Microsoft.AspNetCore.Mvc;
using System.Text.Json;

namespace MicroservicioUsuarios
{
    public static class UsuariosEndpoints
    {
        public static void MapUsuarioEndpoints(this IEndpointRouteBuilder routes)
        {
            var group = routes.MapGroup("/usuario").WithTags(nameof(Usuario)).RequireCors("ClientApps");

            string ObtenerToken(HttpRequest request) =>
                request.Headers.Authorization.ToString().Replace("Bearer ", "");

            async Task<bool> TokenValidoAsync(HttpRequest request, IAuthServiceClient authService)
                => await authService.ValidarAsync(ObtenerToken(request));

            bool ObtenerUsuarioId(HttpRequest request, out Guid usuarioId)
                => Guid.TryParse(request.Headers["X-Usuario-Id"], out usuarioId) && usuarioId != Guid.Empty;

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

            // GET listar o filtrar
            group.MapGet("/", async (
                HttpRequest request,
                string? identificacion, string? nombre, string? tipo, string? dominio, string? rol,
                [FromServices] IUsuarioService service,
                [FromServices] IAuthServiceClient authService,
                [FromServices] IBitacoraServiceClient bitacoraService) =>
            {
                if (!await TokenValidoAsync(request, authService))
                    return Results.Unauthorized();

                if (!ObtenerUsuarioId(request, out var usuarioId))
                    return Results.BadRequest(new { message = "El usuario es requerido" });

                return await EjecutarAsync(async () =>
                {
                    var usuarios = await service.ConsultarAsync(identificacion, nombre, tipo, dominio, rol);
                    await bitacoraService.RegistrarAsycn(usuarioId, "El usuario consulta usuarios", ObtenerToken(request));
                    return Results.Ok(usuarios);
                });
            })
            .WithName("GetAllUsuarios")
            .WithOpenApi();

            // GET email
            group.MapGet("/{email}", async (
                HttpRequest request, string email,
                [FromServices] IUsuarioService service,
                [FromServices] IAuthServiceClient authService,
                [FromServices] IBitacoraServiceClient bitacoraService) =>
            {
                if (!await TokenValidoAsync(request, authService))
                    return Results.Unauthorized();

                if (!ObtenerUsuarioId(request, out var usuarioId))
                    return Results.BadRequest(new { message = "El usuario es requerido" });

                return await EjecutarAsync(async () =>
                {
                    var usuario = await service.ObtenerAsync(email);
                    if (usuario is null)
                        return Results.NotFound(new { message = $"No existe un usuario con email '{email}'" });

                    await bitacoraService.RegistrarAsycn(usuarioId, "El usuario consulta usuario " + email, ObtenerToken(request));
                    return Results.Ok(usuario);
                });
            })
            .WithName("GetUsuarioByEmail")
            .WithOpenApi();

            // POST
            group.MapPost("/", async (
                HttpRequest request, [FromBody] UsuarioRequest dto,
                [FromServices] IUsuarioService service,
                [FromServices] IAuthServiceClient authService,
                [FromServices] IBitacoraServiceClient bitacoraService) =>
            {
                if (!await TokenValidoAsync(request, authService))
                    return Results.Unauthorized();

                if (!ObtenerUsuarioId(request, out var usuarioId))
                    return Results.BadRequest(new { message = "El usuario es requerido" });

                return await EjecutarAsync(async () =>
                {
                    var creado = await service.CrearAsync(dto, usuarioId, ObtenerToken(request));
                    await bitacoraService.RegistrarAsycn(usuarioId, JsonSerializer.Serialize(new { dto.Email, dto.Nombre }), ObtenerToken(request));
                    return Results.Created($"/usuario/{dto.Email}", creado);
                });
            })
            .WithName("CreateUsuario")
            .WithOpenApi();

            // PUT
            group.MapPut("/{email}", async (
                HttpRequest request, string email, [FromBody] UsuarioRequest dto,
                [FromServices] IUsuarioService service,
                [FromServices] IAuthServiceClient authService,
                [FromServices] IBitacoraServiceClient bitacoraService) =>
            {
                if (!await TokenValidoAsync(request, authService))
                    return Results.Unauthorized();

                if (!ObtenerUsuarioId(request, out var usuarioId))
                    return Results.BadRequest(new { message = "El usuario es requerido" });

                return await EjecutarAsync(async () =>
                {
                    var (anterior, actual) = await service.ActualizarAsync(email, dto, usuarioId, ObtenerToken(request));
                    var detalle = JsonSerializer.Serialize(new { anterior, actual });
                    await bitacoraService.RegistrarAsycn(usuarioId, detalle, ObtenerToken(request));
                    return Results.Ok(actual);
                });
            })
            .WithName("UpdateUsuario")
            .WithOpenApi();

            // DELETE
            group.MapDelete("/{email}", async (
                HttpRequest request, string email,
                [FromServices] IUsuarioService service,
                [FromServices] IAuthServiceClient authService,
                [FromServices] IBitacoraServiceClient bitacoraService) =>
            {
                if (!await TokenValidoAsync(request, authService))
                    return Results.Unauthorized();

                if (!ObtenerUsuarioId(request, out var usuarioId))
                    return Results.BadRequest(new { message = "El usuario es requerido" });

                return await EjecutarAsync(async () =>
                {
                    var eliminado = await service.EliminarAsync(email);
                    await bitacoraService.RegistrarAsycn(usuarioId, JsonSerializer.Serialize(eliminado), ObtenerToken(request));
                    return Results.NoContent();
                });
            })
            .WithName("DeleteUsuario")
            .WithOpenApi();
        }
    }
}