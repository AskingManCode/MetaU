using MicroservicioMatriculas.Services;

namespace MicroservicioMatriculas
{
    public static class MatriculasEndpoints
    {
        public static void MapearEndpoints(WebApplication app)
        {
            var grupo = app.MapGroup("/matricula");

            grupo.MapPost("/", (MatriculaRequest request, HttpRequest http, IMatriculaService servicio) =>
                Ejecutar(http, async contexto =>
                {
                    var creada = await servicio.Matricular(request, contexto);
                    return Results.Created($"/matricula/{creada.Id}", creada);
                }));

            grupo.MapPut("/{id:int}", (int id, MatriculaRequest request, HttpRequest http, IMatriculaService servicio) =>
                Ejecutar(http, async contexto =>
                    Results.Ok(await servicio.Modificar(id, request, contexto))));

            grupo.MapDelete("/{id:int}", (int id, HttpRequest http, IMatriculaService servicio) =>
                Ejecutar(http, async contexto =>
                {
                    await servicio.Eliminar(id, contexto);
                    return Results.NoContent();
                }));

            grupo.MapGet("/", (string cursoCode, string grupoCode, HttpRequest http, IMatriculaService servicio) =>
                Ejecutar(http, async contexto =>
                    Results.Ok(await servicio.ObtenerEstudiantesMatriculados(cursoCode, grupoCode, contexto))));
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
