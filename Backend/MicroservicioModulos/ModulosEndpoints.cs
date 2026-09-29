using MicroservicioModulos.Services;
using MicroservicioModulos.Entities;
using Microsoft.AspNetCore.Mvc;

namespace MicroservicioRoles
{
    public static class ModulosEndpoints
    {
        public static void MapModuloEndpoints(this IEndpointRouteBuilder routes)
        {
            var group = routes
                .MapGroup("/modulo")
                .WithTags(nameof(Modulos))
                .RequireCors("ClientApps");

            async Task<bool> TokenValidoAsync(HttpRequest request, IAuthService authService)
            {
                if (!request.Headers.TryGetValue("Authorization", out var token))
                    return false;

                return await authService.ValidarAsync(token.ToString().Replace("Bearer ", ""));
            }

            // GET Obtener Todos
            group.MapGet("/", async (
                HttpRequest request,
                [FromServices] IModuloService rolService,
                [FromServices] IAuthService authService,
                [FromServices] IBitacoraService bitacoraService) =>
            {
                if (!await TokenValidoAsync(request, authService))
                    return Results.Unauthorized();

                var roles = await rolService.ObtenerTodosAsync();
                await bitacoraService.RegistrarAsync("sistema", "El usuario consulta modulos");
                return Results.Ok(roles);
            })
            .WithName("GetAllModulos")
            .WithOpenApi();

            // GET Obtener por id
            group.MapGet("/{id}", async (
                HttpRequest request,
                string id,
                [FromServices] IModuloService rolService,
                [FromServices] IAuthService authService,
                [FromServices] IBitacoraService bitacoraService) =>
            {
                if (!await TokenValidoAsync(request, authService))
                    return Results.Unauthorized();

                var rol = await rolService.ObtenerPorIdAsync(id);
                if (rol is null)
                    return Results.NotFound(new { message = $"No existe un modulo con ID '{id}'" });

                await bitacoraService.RegistrarAsync("sistema", $"El usuario consulta rol {id}");
                return Results.Ok(rol);
            })
            .WithName("GetModuloById")
            .WithOpenApi();

            // POST
            group.MapPost("/", async (
                HttpRequest request,
                [FromBody] Modulos rol,
                [FromServices] IModuloService rolService,
                [FromServices] IAuthService authService,
                [FromServices] IBitacoraService bitacoraService) =>
            {
                if (!await TokenValidoAsync(request, authService))
                    return Results.Unauthorized();

                if (string.IsNullOrWhiteSpace(rol.IdModulo) || string.IsNullOrWhiteSpace(rol.Nombre))
                    return Results.BadRequest(new { message = "El ID y el nombre del modulo son obligatorios y no pueden estar vacíos" });

                if (!System.Text.RegularExpressions.Regex.IsMatch(rol.Nombre, @"^[a-zA-ZáéíóúÁÉÍÓÚñÑ\s]+$"))
                    return Results.BadRequest(new { message = "El nombre del modulo solo puede tener letras y espacios" });

                var exists = await rolService.ObtenerPorIdAsync(rol.IdModulo);
                if (exists is not null)
                    return Results.Conflict(new { message = $"Ya existe un modulo con el ID '{rol.IdModulo}'" });

                var rows = await rolService.CrearAsync(rol);
                if (rows <= 0)
                    return Results.Problem("No se pudo crear el modulo");

                await bitacoraService.RegistrarAsync("sistema", $"Registro nuevo: {System.Text.Json.JsonSerializer.Serialize(rol)}");

                return Results.Created($"/modulo/{rol.IdModulo}", rol);
            })
            .WithName("CreateModulo")
            .WithOpenApi();

            // PUT 
            group.MapPut("/{id}", async (
                HttpRequest request,
                string id,
                [FromBody] Modulos rol,
                [FromServices] IModuloService rolService,
                [FromServices] IAuthService authService,
                [FromServices] IBitacoraService bitacoraService) =>
            {
                if (!await TokenValidoAsync(request, authService))
                    return Results.Unauthorized();

                if (!string.Equals(id, rol.IdModulo, StringComparison.OrdinalIgnoreCase))
                    return Results.BadRequest(new { message = "El ID de la ruta y el del cuerpo no coinciden" });

                if (string.IsNullOrWhiteSpace(rol.Nombre))
                    return Results.BadRequest(new { message = "El nombre del modulo es obligatorio" });

                if (!System.Text.RegularExpressions.Regex.IsMatch(rol.Nombre, @"^[a-zA-ZáéíóúÁÉÍÓÚñÑ\s]+$"))
                    return Results.BadRequest(new { message = "El nombre del modulo solo puede tener letras y espacios" });

                var anterior = await rolService.ObtenerPorIdAsync(id);
                if (anterior is null)
                    return Results.NotFound(new { message = $"No existe un modulo con ID '{id}'" });

                var updated = await rolService.ActualizarAsync(rol);
                if (updated <= 0)
                    return Results.Problem("No se pudo actualizar el modulo");

                var actual = await rolService.ObtenerPorIdAsync(id) ?? rol;

                var detalle = System.Text.Json.JsonSerializer.Serialize(new { anterior, actual });
                await bitacoraService.RegistrarAsync("sistema", detalle);

                return Results.Ok(actual);
            })
            .WithName("UpdateRol")
            .WithOpenApi();

            // DELETE 
            group.MapDelete("/{id}", async (
                HttpRequest request,
                string id,
                [FromServices] IModuloService rolService,
                [FromServices] IAuthService authService,
                [FromServices] IBitacoraService bitacoraService) =>
            {
                if (!await TokenValidoAsync(request, authService))
                    return Results.Unauthorized();

                var exists = await rolService.ObtenerPorIdAsync(id);
                if (exists is null)
                    return Results.NotFound(new { message = $"No existe un modulo con ID '{id}'" });

                var deleted = await rolService.EliminarAsync(id);
                if (deleted <= 0)
                    return Results.Problem("No se pudo eliminar el modulo");

                await bitacoraService.RegistrarAsync("sistema", System.Text.Json.JsonSerializer.Serialize(exists));

                return Results.NoContent();
            })
            .WithName("DeleteRol")
            .WithOpenApi();
        }
    }
}
