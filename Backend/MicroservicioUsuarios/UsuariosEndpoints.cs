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

            async Task<bool> TokenValidoAsync(HttpRequest request, IAuthService authService)
            {
                if (!request.Headers.TryGetValue("Authorization", out var token)) return false;
                return await authService.ValidarAsync(token.ToString().Replace("Bearer ", ""));
            }

            string ObtenerToken(HttpRequest request)
                => request.Headers.Authorization.ToString().Replace("Bearer ", "");

            // GET de filtrar o listar
            group.MapGet("/", async (
                HttpRequest request,
                string? identificacion, string? nombre, string? tipo,
                [FromServices] IUsuarioService service,
                [FromServices] IAuthService authService,
                [FromServices] IBitacoraServiceClient bitacora) =>
            {
                if (!await TokenValidoAsync(request, authService)) return Results.Unauthorized();

                var hayFiltro = identificacion is not null || nombre is not null || tipo is not null;
                var usuarios = hayFiltro
                    ? await service.FiltrarAsync(identificacion, nombre, tipo)
                    : await service.ListarAsync();

                await bitacora.RegistrarAsycn(0, "El usuario consulta usuarios", ObtenerToken(request));
                return Results.Ok(usuarios);
            });

            // GET email
            group.MapGet("/{email}", async (
                HttpRequest request, string email,
                [FromServices] IUsuarioService service,
                [FromServices] IAuthService authService,
                [FromServices] IBitacoraServiceClient bitacora) =>
            {
                if (!await TokenValidoAsync(request, authService)) return Results.Unauthorized();

                var usuario = await service.ObtenerAsync(email);
                if (usuario is null) return Results.NotFound(new { message = $"No existe un usuario con email '{email}'." });

                await bitacora.RegistrarAsycn(0, $"El usuario consulta usuario {email}", ObtenerToken(request));
                return Results.Ok(usuario);
            });

            // POST 
            group.MapPost("/", async (
                HttpRequest request, [FromBody] UsuarioRequest dto,
                [FromServices] IUsuarioService service,
                [FromServices] IAuthService authService,
                [FromServices] IBitacoraServiceClient bitacora) =>
            {
                if (!await TokenValidoAsync(request, authService)) return Results.Unauthorized();

                var (valido, error) = await service.ValidarAsync(dto, actualizacion: false);
                if (!valido) return Results.BadRequest(new { message = error });

                var existente = await service.ObtenerAsync(dto.Email);
                if (existente is not null) return Results.Conflict(new { message = $"Ya existe un usuario con email '{dto.Email}'." });

                var filas = await service.CrearAsync(dto);
                if (filas <= 0) return Results.Problem("No se pudo crear el usuario");

                await bitacora.RegistrarAsycn(0, $"Registro nuevo: {System.Text.Json.JsonSerializer.Serialize(new { dto.Email, dto.Nombre })}", ObtenerToken(request));

                var creado = await service.ObtenerAsync(dto.Email);
                return Results.Created($"/usuario/{dto.Email}", creado);
            });

            // PUT 
            group.MapPut("/{email}", async (
                HttpRequest request, string email, [FromBody] UsuarioRequest dto,
                [FromServices] IUsuarioService service,
                [FromServices] IAuthService authService,
                [FromServices] IBitacoraServiceClient bitacora) =>
            {
                if (!await TokenValidoAsync(request, authService)) return Results.Unauthorized();

                var (valido, error) = await service.ValidarAsync(dto, actualizacion: true);
                if (!valido) return Results.BadRequest(new { message = error });

                var anterior = await service.ObtenerAsync(email);
                if (anterior is null) return Results.NotFound(new { message = $"No existe un usuario con email '{email}'." });

                var filas = await service.ActualizarAsync(email, dto);
                if (filas <= 0) return Results.Problem("No se pudo actualizar el usuario");

                var actual = await service.ObtenerAsync(email);
                await bitacora.RegistrarAsycn(0, System.Text.Json.JsonSerializer.Serialize(new { anterior, actual }), ObtenerToken(request));

                return Results.Ok(actual);
            });

            // DELETE 
            group.MapDelete("/{email}", async (
                HttpRequest request, string email,
                [FromServices] IUsuarioService service,
                [FromServices] IAuthService authService,
                [FromServices] IBitacoraServiceClient bitacora) =>
            {
                if (!await TokenValidoAsync(request, authService)) return Results.Unauthorized();

                var existente = await service.ObtenerAsync(email);
                if (existente is null) return Results.NotFound(new { message = $"No existe un usuario con email '{email}'." });

                var filas = await service.EliminarAsync(email);
                if (filas <= 0) return Results.Problem("No se pudo eliminar el usuario");

                await bitacora.RegistrarAsycn(0, System.Text.Json.JsonSerializer.Serialize(existente), ObtenerToken(request));
                return Results.NoContent();
            });
        }
    }
}