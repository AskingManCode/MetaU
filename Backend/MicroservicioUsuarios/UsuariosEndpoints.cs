using MicroservicioUsuarios.Entities;
using MicroservicioUsuarios.Services;
using Microsoft.AspNetCore.Mvc;

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

            // GET listar o filtrar
            group.MapGet("/", async (
                HttpRequest request,
                string? identificacion, string? nombre, string? tipo,
                [FromServices] IUsuarioService service,
                [FromServices] IAuthServiceClient authService,
                [FromServices] IBitacoraServiceClient bitacoraService) =>
            {
                if (!await TokenValidoAsync(request, authService))
                    return Results.Unauthorized();

                if (!ObtenerUsuarioId(request, out var usuarioId))
                    return Results.BadRequest(new { message = "El usuario es requerido" });

                var hayFiltro = identificacion is not null || nombre is not null || tipo is not null;
                var usuarios = hayFiltro
                    ? await service.FiltrarAsync(identificacion, nombre, tipo)
                    : await service.ListarAsync();

                await bitacoraService.RegistrarAsycn(usuarioId, "El usuario consulta usuarios", ObtenerToken(request));
                return Results.Ok(usuarios);
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

                var usuario = await service.ObtenerAsync(email);
                if (usuario is null)
                    return Results.NotFound(new { message = $"No existe un usuario con email '{email}'" });

                await bitacoraService.RegistrarAsycn(usuarioId, "El usuario consulta usuario " + email, ObtenerToken(request));
                return Results.Ok(usuario);
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

                var (valido, error) = await service.ValidarAsync(dto, false, usuarioId, ObtenerToken(request));
                if (!valido)
                    return Results.BadRequest(new { message = error });

                var existente = await service.ObtenerAsync(dto.Email);
                if (existente is not null)
                    return Results.Conflict(new { message = $"Ya existe un usuario con email '{dto.Email}'" });

                var mismaIdentificacion = await service.FiltrarAsync(dto.Identificacion, null, null);
                if (mismaIdentificacion.Any())
                    return Results.Conflict(new { message = $"Ya existe un usuario con la identificación '{dto.Identificacion}'" });

                var filas = await service.CrearAsync(dto);
                if (filas <= 0)
                    return Results.Problem("No se pudo crear el usuario");

                var creado = await service.ObtenerAsync(dto.Email);

                await bitacoraService.RegistrarAsycn(usuarioId, System.Text.Json.JsonSerializer.Serialize(new { dto.Email, dto.Nombre }), ObtenerToken(request));

                return Results.Created($"/usuario/{dto.Email}", creado);
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

                var (valido, error) = await service.ValidarAsync(dto, true, usuarioId, ObtenerToken(request));
                if (!valido)
                    return Results.BadRequest(new { message = error });

                var anterior = await service.ObtenerAsync(email);
                if (anterior is null)
                    return Results.NotFound(new { message = $"No existe un usuario con email '{email}'" });

                var filas = await service.ActualizarAsync(email, dto);
                if (filas <= 0)
                    return Results.Problem("No se pudo actualizar el usuario");

                var actual = await service.ObtenerAsync(email);
                var detalle = System.Text.Json.JsonSerializer.Serialize(new { anterior, actual });
                await bitacoraService.RegistrarAsycn(usuarioId, detalle, ObtenerToken(request));

                return Results.Ok(actual);
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

                var existente = await service.ObtenerAsync(email);
                if (existente is null)
                    return Results.NotFound(new { message = $"No existe un usuario con email '{email}'" });

                var filas = await service.EliminarAsync(email);
                if (filas <= 0)
                    return Results.Problem("No se pudo eliminar el usuario");

                await bitacoraService.RegistrarAsycn(usuarioId, System.Text.Json.JsonSerializer.Serialize(existente), ObtenerToken(request));

                return Results.NoContent();
            })
            .WithName("DeleteUsuario")
            .WithOpenApi();
        }
    }
}