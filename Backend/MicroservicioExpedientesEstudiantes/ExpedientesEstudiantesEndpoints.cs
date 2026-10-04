using MicroservicioExpedientesEstudiantes.Services;

namespace MicroservicioExpedientesEstudiantes
{
    public static class ExpedientesEstudiantesEndpoints
    {
        public static void MapearEndpoints(WebApplication app)
        {
            var grupo = app.MapGroup("/expediente");

            grupo.MapPost("/", (EstudianteRequest request, HttpRequest http, IExpedienteService servicio) =>
                Ejecutar(http, async contexto =>
                {
                    var creado = await servicio.Crear(request, contexto);
                    return Results.Created($"/expediente/{creado.Identificacion}", creado);
                }));

            grupo.MapPut("/{identificacion}", (string identificacion, EstudianteRequest request,
                HttpRequest http, IExpedienteService servicio) =>
                Ejecutar(http, async contexto =>
                    Results.Ok(await servicio.Modificar(identificacion, request, contexto))));

            grupo.MapDelete("/{identificacion}", (string identificacion, HttpRequest http, IExpedienteService servicio) =>
                Ejecutar(http, async contexto =>
                {
                    await servicio.Eliminar(identificacion, contexto);
                    return Results.NoContent();
                }));

            grupo.MapGet("/", (HttpRequest http, IExpedienteService servicio) =>
                Ejecutar(http, async contexto =>
                    Results.Ok(await servicio.ObtenerTodos(contexto))));

            grupo.MapGet("/{identificacion}", (string identificacion, HttpRequest http, IExpedienteService servicio) =>
                Ejecutar(http, async contexto =>
                {
                    var estudiante = await servicio.ObtenerPorId(identificacion, contexto);
                    return estudiante is null
                        ? Results.NotFound(new { mensaje = "No existe un expediente con esa identificación." })
                        : Results.Ok(estudiante);
                }));
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