using MicroservicioRoles.Entities;
using MicroservicioRoles.Services;
using Microsoft.AspNetCore.Mvc;

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

            // GET Obtener Todos
            group.MapGet("/", async (
                HttpRequest request,
                [FromServices] IRolService rolService,
                [FromServices] IAuthServiceClient authService,
                [FromServices] IBitacoraServiceClient bitacoraService) =>
            {
                if (!await TokenValidoAsync(request, authService))
                    return Results.Unauthorized();

                if (!ObtenerUsuarioId(request, out var usuarioId))
                    return Results.BadRequest(new { message = "El usuario es requerido" });

                var roles = await rolService.ObtenerTodosAsync();
                await bitacoraService.RegistrarAsync(usuarioId, "El usuario consulta roles", ObtenerToken(request));
                return Results.Ok(roles);
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

                var rol = await rolService.ObtenerPorIdAsync(id);
                if (rol is null)
                    return Results.NotFound(new { message = $"No existe un rol con ID '{id}'" });

                await bitacoraService.RegistrarAsync(usuarioId, "El usuario consulta rol " + id, ObtenerToken(request));
                return Results.Ok(rol);
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

                if (string.IsNullOrWhiteSpace(rol.IdRol) || string.IsNullOrWhiteSpace(rol.Nombre))
                    return Results.BadRequest(new { message = "El ID y el nombre del rol son obligatorios y no pueden estar vacíos" });

                if (!System.Text.RegularExpressions.Regex.IsMatch(rol.IdRol, @"^[A-Z]{1,15}$"))
                    return Results.BadRequest(new { message = "El ID del rol solo puede tener letras mayusculas" });

                if (!System.Text.RegularExpressions.Regex.IsMatch(rol.Nombre, @"^[a-zA-ZáéíóúÁÉÍÓÚñÑ\s]+$"))
                    return Results.BadRequest(new { message = "El nombre del rol solo puede tener letras y espacios" });

                var exists = await rolService.ObtenerPorIdAsync(rol.IdRol);
                if (exists is not null)
                    return Results.Conflict(new { message = $"Ya existe un rol con el ID '{rol.IdRol}'" });

                var rows = await rolService.CrearAsync(rol);
                if (rows <= 0)
                    return Results.Problem("No se pudo crear el rol");

                await bitacoraService.RegistrarAsync(usuarioId, System.Text.Json.JsonSerializer.Serialize(rol), ObtenerToken(request));

                return Results.Created($"/rol/{rol.IdRol}", rol);
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

                if (!string.Equals(id, rol.IdRol, StringComparison.OrdinalIgnoreCase))
                    return Results.BadRequest(new { message = "El ID de la ruta y el del cuerpo no coinciden" });

                if (string.IsNullOrWhiteSpace(rol.Nombre))
                    return Results.BadRequest(new { message = "El nombre del rol es obligatorio" });

                if (!System.Text.RegularExpressions.Regex.IsMatch(rol.Nombre, @"^[a-zA-ZáéíóúÁÉÍÓÚñÑ\s]+$"))
                    return Results.BadRequest(new { message = "El nombre del rol solo puede tener letras y espacios" });

                var anterior = await rolService.ObtenerPorIdAsync(id);
                if (anterior is null)
                    return Results.NotFound(new { message = $"No existe un rol con ID '{id}'" });

                var updated = await rolService.ActualizarAsync(rol);
                if (updated <= 0)
                    return Results.Problem("No se pudo actualizar el rol");

                var actual = await rolService.ObtenerPorIdAsync(id) ?? rol;

                var detalle = System.Text.Json.JsonSerializer.Serialize(new { anterior, actual });
                await bitacoraService.RegistrarAsync(usuarioId, detalle, ObtenerToken(request));

                return Results.Ok(actual);
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

                var exists = await rolService.ObtenerPorIdAsync(id);
                if (exists is null)
                    return Results.NotFound(new { message = $"No existe un rol con ID '{id}'" });

                var deleted = await rolService.EliminarAsync(id);
                if (deleted <= 0)
                    return Results.Problem("No se pudo eliminar el rol");

                await bitacoraService.RegistrarAsync(usuarioId, System.Text.Json.JsonSerializer.Serialize(exists), ObtenerToken(request));

                return Results.NoContent();
            })
            .WithName("DeleteRol")
            .WithOpenApi();
        }
    }
}
