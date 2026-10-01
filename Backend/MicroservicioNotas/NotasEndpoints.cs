using MicroservicioNotas.Services;

namespace MicroservicioNotas
{
    public static class NotasEndpoints
    {
        public static void MapearEndpoints(WebApplication app)
        {
            app.MapPost("/cargardesglose", (DesgloseRequest request, HttpRequest http, INotaService servicio) =>
                Ejecutar(http, async contexto => Results.Created(
                    $"/obtenerdesglose?grupoCode={request.GrupoCode}",
                    await servicio.CargarDesglose(request, contexto))));

            app.MapPost("/asignarnotarubro", (NotaRubroRequest request, HttpRequest http, INotaService servicio) =>
                Ejecutar(http, async contexto =>
                    Results.Created($"/obtenernotas?identificacion={request.Identificacion}", await servicio.AsignarNotaRubro(request, contexto))));

            app.MapPut("/asignarnotarubro", (NotaRubroRequest request, HttpRequest http, INotaService servicio) =>
                Ejecutar(http, async contexto => Results.Ok(await servicio.ModificarNotaRubro(request, contexto))));

            app.MapGet("/obtenerdesglose", (string grupoCode, HttpRequest http, INotaService servicio) =>
                Ejecutar(http, async contexto => Results.Ok(await servicio.ObtenerDesglose(grupoCode, contexto))));

            app.MapGet("/obtenernotas", (string identificacion, string idCurso, HttpRequest http, INotaService servicio) =>
                Ejecutar(http, async contexto => Results.Ok(await servicio.ObtenerNotas(identificacion, idCurso, contexto))));
        }

        private static async Task<IResult> Ejecutar(HttpRequest http, Func<ContextoUsuario, Task<IResult>> accion)
        {
            var authClient = http.HttpContext.RequestServices.GetRequiredService<IAuthClient>();
            var bitacoraClient = http.HttpContext.RequestServices.GetRequiredService<IBitacoraClient>();

            var token = http.Headers.Authorization.ToString().Replace("Bearer ", "");
            var usuarioHeader = http.Headers["Usuario"].ToString();

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
