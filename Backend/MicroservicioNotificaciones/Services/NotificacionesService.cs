using System.Text.Json;
using MailKit.Net.Smtp;
using MailKit.Security;
using Microsoft.Extensions.Options;
using MimeKit;
using MicroservicioNotificaciones.Configuration;
using MicroservicioNotificaciones.Entities;
using MicroservicioNotificaciones.Repository;

namespace MicroservicioNotificaciones.Services
{
    public class NotificacionesService : INotificacionesService
    {
        private readonly SmtpSettings _smtp;
        private readonly INotificacionesRepository _repository;

        public NotificacionesService(IOptions<SmtpSettings> smtpOptions, INotificacionesRepository repository)
        {
            this._smtp = smtpOptions.Value;
            this._repository = repository;
        }

        public async Task<NotificarResponse> EnviarCorreoAsync(
            NotificarRequest request,
            Guid usuarioId)
        {
            var parametrosJson = JsonSerializer.Serialize(new 
            {
                request.Asunto,
                request.Cuerpo
            });

            var notificacion = await _repository.CrearAsync(usuarioId, request.Email, parametrosJson);

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
                    mensajeError: null,
                    fechaEnvio: fechaEnvio);

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
    }
}