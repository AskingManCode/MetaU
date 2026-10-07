using MicroservicioPreMatriculas.Services;

namespace MicroservicioPreMatriculas
{
    public static class PreMatriculasEndpoints
    {
        public static void MapearEndpoints(WebApplication app)
        {
            var grupo = app.MapGroup("/prematricula");

            grupo.MapPost("/", (PrematriculaRequest request, HttpRequest http, IPrematriculaService servicio) =>
                Ejecutar(http, async contexto =>
                {
                    var creada = await servicio.Prematricular(request, contexto);
                    return Results.Created($"/prematricula/{creada.Id}", creada);
                }));

            grupo.MapPut("/{id:guid}", (Guid id, PrematriculaRequest request, HttpRequest http, IPrematriculaService servicio) =>
                Ejecutar(http, async contexto =>
                    Results.Ok(await servicio.Modificar(id, request, contexto))));

            grupo.MapDelete("/{id:guid}", (Guid id, HttpRequest http, IPrematriculaService servicio) =>
                Ejecutar(http, async contexto =>
                {
                    await servicio.Eliminar(id, contexto);
                    return Results.NoContent();
                }));

            grupo.MapGet("/", (HttpRequest http, IPrematriculaService servicio) =>
                Ejecutar(http, async contexto =>
                    Results.Ok(await servicio.ObtenerTodas(contexto))));

            grupo.MapGet("/{id:guid}", (Guid id, HttpRequest http, IPrematriculaService servicio) =>
                Ejecutar(http, async contexto =>
                    Results.Ok(await servicio.ObtenerPorId(id, contexto))));
        }

        private static async Task<IResult> Ejecutar(HttpRequest http, Func<ContextoUsuario, Task<IResult>> accion)
        {
            var authClient = http.HttpContext.RequestServices.GetRequiredService<IAuthClient>();
            var bitacoraClient = http.HttpContext.RequestServices.GetRequiredService<IBitacoraClient>();

            var token = http.Headers.Authorization.ToString().Replace("Bearer ", "");
            var usuarioHeader = http.Headers["X-Usuario-Id"].ToString();

            if (string.IsNullOrWhiteSpace(token) ||
                !Guid.TryParse(usuarioHeader, out var usuarioId) ||
                !await authClient.Validate(token))
            {
                return Results.Json(new { mensaje = "No autorizado" }, statusCode: StatusCodes.Status401Unauthorized);
            }

            var contexto = new ContextoUsuario(usuarioId, token);

            try
            {
                return await accion(contexto);
            }
            catch (ValidacionException ex)
            {
                return Results.BadRequest(new { mensaje = ex.Message });
            }
            catch (NoEncontradoException ex)
            {
                return Results.NotFound(new { mensaje = ex.Message });
            }
            catch (ConflictoException ex)
            {
                return Results.Conflict(new { mensaje = ex.Message });
            }
            catch (Exception ex)
            {
                try { await bitacoraClient.Registrar(contexto, $"Error técnico: {ex.Message}"); }
                catch { }

                return Results.Json(new { mensaje = "Error interno del servidor" },
                    statusCode: StatusCodes.Status500InternalServerError);
            }
        }
    }
}
