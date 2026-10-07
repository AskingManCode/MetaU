using MicroservicioModulos.Entities;
using MicroservicioModulos.Services;
using Microsoft.AspNetCore.Mvc;

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

            // GET Obtener Todos
            group.MapGet("/", async (
                HttpRequest request,
                [FromServices] IModuloService moduloService,
                [FromServices] IAuthServiceClient authService,
                [FromServices] IBitacoraServiceClient bitacoraService) =>
            {
                if (!await TokenValidoAsync(request, authService))
                    return Results.Unauthorized();

                if (!ObtenerUsuarioId(request, out var usuarioId))
                    return Results.BadRequest(new { message = "El usuario es requerido" });

                var modulos = await moduloService.ObtenerTodosAsync();
                await bitacoraService.RegistrarAsync(usuarioId, "El usuario consulta modulos", ObtenerToken(request));
                return Results.Ok(modulos);
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

                var modulo = await moduloService.ObtenerPorIdAsync(id);
                if (modulo is null)
                    return Results.NotFound(new { message = $"No existe un modulo con ID '{id}'" });

                await bitacoraService.RegistrarAsync(usuarioId, "El usuario consulta modulo " + id, ObtenerToken(request));
                return Results.Ok(modulo);
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

                if (string.IsNullOrWhiteSpace(modulo.IdModulo) || string.IsNullOrWhiteSpace(modulo.Nombre))
                    return Results.BadRequest(new { message = "El ID y el nombre del modulo son obligatorios y no pueden estar vacíos" });

                if (!System.Text.RegularExpressions.Regex.IsMatch(modulo.IdModulo, @"^[A-Z]{1,15}$"))
                    return Results.BadRequest(new { message = "El ID del rol solo puede tener letras mayusculas" });


                if (!System.Text.RegularExpressions.Regex.IsMatch(modulo.Nombre, @"^[a-zA-ZáéíóúÁÉÍÓÚñÑ\s]+$"))
                    return Results.BadRequest(new { message = "El nombre del modulo solo puede tener letras y espacios" });

                var exists = await moduloService.ObtenerPorIdAsync(modulo.IdModulo);
                if (exists is not null)
                    return Results.Conflict(new { message = $"Ya existe un modulo con el ID '{modulo.IdModulo}'" });

                var rows = await moduloService.CrearAsync(modulo);
                if (rows <= 0)
                    return Results.Problem("No se pudo crear el modulo");

                await bitacoraService.RegistrarAsync(usuarioId, System.Text.Json.JsonSerializer.Serialize(modulo), ObtenerToken(request));

                return Results.Created($"/modulo/{modulo.IdModulo}", modulo);
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

                if (!string.Equals(id, modulo.IdModulo, StringComparison.OrdinalIgnoreCase))
                    return Results.BadRequest(new { message = "El ID de la ruta y el del cuerpo no coinciden" });

                if (string.IsNullOrWhiteSpace(modulo.Nombre))
                    return Results.BadRequest(new { message = "El nombre del modulo es obligatorio" });

                if (!System.Text.RegularExpressions.Regex.IsMatch(modulo.Nombre, @"^[a-zA-ZáéíóúÁÉÍÓÚñÑ\s]+$"))
                    return Results.BadRequest(new { message = "El nombre del modulo solo puede tener letras y espacios" });

                var anterior = await moduloService.ObtenerPorIdAsync(id);
                if (anterior is null)
                    return Results.NotFound(new { message = $"No existe un modulo con ID '{id}'" });

                var updated = await moduloService.ActualizarAsync(modulo);
                if (updated <= 0)
                    return Results.Problem("No se pudo actualizar el modulo");

                var actual = await moduloService.ObtenerPorIdAsync(id) ?? modulo;

                var detalle = System.Text.Json.JsonSerializer.Serialize(new { anterior, actual });
                await bitacoraService.RegistrarAsync(usuarioId, detalle, ObtenerToken(request));

                return Results.Ok(actual);
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

                var exists = await moduloService.ObtenerPorIdAsync(id);
                if (exists is null)
                    return Results.NotFound(new { message = $"No existe un modulo con ID '{id}'" });

                var deleted = await moduloService.EliminarAsync(id);
                if (deleted <= 0)
                    return Results.Problem("No se pudo eliminar el modulo");

                await bitacoraService.RegistrarAsync(usuarioId, System.Text.Json.JsonSerializer.Serialize(exists), ObtenerToken(request));

                return Results.NoContent();
            })
            .WithName("DeleteModulo")
            .WithOpenApi();
        }
    }
}