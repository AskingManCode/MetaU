using FluentValidation;
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
            catch (ValidationException ex)
            {
                var errores = ex.Errors
                    .Select(e => new
                    {
                        campo = e.PropertyName,
                        mensaje = e.ErrorMessage
                    });

                return Results.BadRequest(new { errores });
            }
            catch (ArgumentException ex)
            {
                return Results.BadRequest(new { mensaje = ex.Message });
            }
            catch (Exception ex)
            {
                return Results.Json(new 
                { 
                    mensaje = "Error interno del servidor" 
                }, statusCode: 500);
            }
        }
    }
}
