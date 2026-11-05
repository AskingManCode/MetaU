using System.Text.Json;
using FluentValidation;
using MailKit.Net.Smtp;
using MailKit.Security;
using Microsoft.Extensions.Options;
using MimeKit;
using MicroservicioNotificaciones.Configuration;
using MicroservicioNotificaciones.Entities;
using MicroservicioNotificaciones.Repository;
using MicroservicioNotificaciones.Services.Clients;

namespace MicroservicioNotificaciones.Services
{
    public class NotificacionesService : INotificacionesService
    {
        private readonly SmtpSettings _smtp;
        private readonly INotificacionesRepository _repository;
        private readonly IAuthServiceValidator _authValidator;
        private readonly IBitacoraServiceClient _bitacoraClient;
        private readonly IValidator<NotificarRequest> _validator;

        public NotificacionesService(
            IOptions<SmtpSettings> smtpOptions,
            INotificacionesRepository repository,
            IAuthServiceValidator authValidator,
            IBitacoraServiceClient bitacoraClient,
            IValidator<NotificarRequest> validator)
        {
            _smtp = smtpOptions.Value;
            _repository = repository;
            _authValidator = authValidator;
            _bitacoraClient = bitacoraClient;
            _validator = validator;
        }

        public async Task<NotificarResponse> EnviarCorreoAsync(
            NotificarRequest request,
            HttpRequest httpRequest)
        {
            var (usuario, token, error) = await _authValidator.ValidarAsync(httpRequest);

            if (error is not null)
                throw new UnauthorizedAccessException("No autorizado");

            var validationResult = await _validator.ValidateAsync(request);

            if (!validationResult.IsValid)
                throw new ValidationException(validationResult.Errors);

            try
            {
                var parametrosJson = JsonSerializer.Serialize(new
                {
                    request.Asunto,
                    request.Cuerpo
                });

                var notificacion = await _repository.CrearAsync(usuario, request.Email, parametrosJson);

                try
                {
                    var message = new MimeMessage();

                    message.From.Add(new MailboxAddress(_smtp.FromName, _smtp.From));
                    message.To.Add(MailboxAddress.Parse(request.Email));
                    message.Subject = request.Asunto;
                    message.Body = new BodyBuilder { HtmlBody = request.Cuerpo }.ToMessageBody();

                    using var client = new SmtpClient();

                    await client.ConnectAsync(_smtp.Host, _smtp.Port,
                        _smtp.EnableSsl ? SecureSocketOptions.StartTls : SecureSocketOptions.None);

                    await client.AuthenticateAsync(_smtp.User, _smtp.Password);
                    await client.SendAsync(message);
                    await client.DisconnectAsync(true);

                    var fechaEnvio = DateTime.UtcNow;

                    await _repository.ActualizarEstadoAsync(
                        notificacion.NotificacionID,
                        "ENVIADO",
                        mensajeError: string.Empty,
                        fechaEnvio: fechaEnvio);

                    try
                    {
                        await _bitacoraClient.RegistrarBitacoraAsync(
                            usuario,
                            $"Se envió notificación a {request.Email}. Asunto: {request.Asunto}",
                            token);
                    }
                    catch
                    {
                        // No falla la operación principal si la bitácora falla
                    }

                    return new NotificarResponse
                    {
                        Email = request.Email,
                        Asunto = request.Asunto,
                        Cuerpo = request.Cuerpo,
                        Estado = "ENVIADO",
                        Mensaje = "Correo enviado correctamente",
                        FechaEnvio = fechaEnvio
                    };
                }
                catch (Exception ex)
                {
                    await _repository.ActualizarEstadoAsync(
                        notificacion.NotificacionID,
                        "ERROR",
                        mensajeError: ex.Message.Length > 500
                            ? ex.Message[..500]
                            : ex.Message);

                    throw;
                }
            }
            catch (Exception ex) when (ex is not UnauthorizedAccessException && ex is not ValidationException)
            {
                try
                {
                    await _bitacoraClient.RegistrarBitacoraAsync(
                        usuario,
                        $"Error técnico al enviar notificación a {request.Email}",
                        token);
                }
                catch
                {
                    // Ignorar fallo de bitácora
                }

                throw;
            }
        }
    }
}
