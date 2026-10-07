using FluentValidation;
using MicroservicioNotificaciones.Entities;
using MicroservicioNotificaciones.Services;
using MicroservicioNotificaciones.Services.Clients;

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
            IValidator<NotificarRequest> validator,
            IAuthServiceValidator authServiceValidator,
            INotificacionesService service,
            IBitacoraServiceClient bitacoraService)
        {
            var (usuario, token, error) = await authServiceValidator.ValidarAsync(httpRequest);

            if (error is not null)
                return error;
            
            var validationResult = await validator.ValidateAsync(request);

            if (!validationResult.IsValid)
            {
                var errores = validationResult.Errors
                    .Select(e => new
                    {
                        campo = e.PropertyName,
                        mensaje = e.ErrorMessage
                    });

                return Results.BadRequest(new { errores });
            }

            try
            {
                var resultado = await service.EnviarCorreoAsync(request);
                
                try
                {
                    await bitacoraService.RegistrarBitacoraAsync(
                        usuario,
                        $"Se envió notificación a {request.Email}. Asunto: {request.Asunto}",
                        token);
                }
                catch
                {
                    // No fallar la operación principal si la bitácora falla
                }

                return Results.Ok(resultado);
            }
            catch (ArgumentException ex)
            {
                try
                {
                    await bitacoraService.RegistrarBitacoraAsync(
                        usuario,
                        $"Error de validación al enviar notificación a {request.Email}: {ex.Message}",
                        token);
                }
                catch { }

                return Results.BadRequest(new { mensaje = ex.Message });
            }
            catch (Exception)
            {
                try
                {
                    await bitacoraService.RegistrarBitacoraAsync(
                        usuario,
                        $"Error técnico al enviar notificación a {request.Email}",
                        token);
                }
                catch { }

                return Results.Json(
                    new { mensaje = "Error interno del servidor" },
                    statusCode: 500);
            }
        }
    }
}
