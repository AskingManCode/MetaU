using MicroservicioNotificaciones.Entities;
using MicroservicioNotificaciones.Services;

namespace MicroservicioNotificaciones
{
    public static class NotificacionesEndpoints
    {
        public static void MapNotificacionesEndpoints(this WebApplication app)
        {
            var group = app.MapGroup("/api/notificar");

            group.MapPost("/", EnviarCorreo);
            group.MapPost("/multiple", EnviarCorreosMultiples);
            group.MapGet("/", ObtenerHistorial);
        }

        private static async Task<IResult> EnviarCorreo(
            NotificarRequest request,
            HttpRequest httpRequest,
            INotificacionesService service)
        {
            try
            {
                var resultado = await service.EnviarCorreoAsync(request, httpRequest);
                return Results.Ok(resultado);
            }
            catch (UnauthorizedAccessException ex)
            {
                return Results.Json(new { mensaje = ex.Message }, statusCode: 401);
            }
            catch (ArgumentException ex)
            {
                return Results.BadRequest(new { mensaje = ex.Message });
            }
            catch (InvalidOperationException ex)
            {
                return Results.BadRequest(new { mensaje = ex.Message });
            }
            catch (Exception)
            {
                return Results.Json(new 
                { 
                    mensaje = "Error interno del servidor" 
                }, statusCode: 500);
            }
        }

        private static async Task<IResult> EnviarCorreosMultiples(
            NotificarMultipleRequest request,
            HttpRequest httpRequest,
            INotificacionesService service)
        {
            try
            {
                var resultado = await service.EnviarCorreosMultiplesAsync(request, httpRequest);
                return Results.Ok(resultado);
            }
            catch (UnauthorizedAccessException ex)
            {
                return Results.Json(new { mensaje = ex.Message }, statusCode: 401);
            }
            catch (ArgumentException ex)
            {
                return Results.BadRequest(new { mensaje = ex.Message });
            }
            catch (InvalidOperationException ex)
            {
                return Results.BadRequest(new { mensaje = ex.Message });
            }
            catch (Exception)
            {
                return Results.Json(new 
                { 
                    mensaje = "Error interno del servidor" 
                }, statusCode: 500);
            }
        }

        private static async Task<IResult> ObtenerHistorial(
            HttpRequest httpRequest,
            INotificacionesService service)
        {
            try
            {
                var historial = await service.ObtenerHistorialAsync(httpRequest);
                return Results.Ok(historial);
            }
            catch (UnauthorizedAccessException ex)
            {
                return Results.Json(new { mensaje = ex.Message }, statusCode: 401);
            }
            catch (ArgumentException ex)
            {
                return Results.BadRequest(new { mensaje = ex.Message });
            }
            catch (Exception)
            {
                return Results.Json(new 
                { 
                    mensaje = "Error interno del servidor" 
                }, statusCode: 500);
            }
        }
    }
}
