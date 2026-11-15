using System.Text.Json;
using FluentValidation;
using MailKit.Net.Smtp;
using MailKit.Security;
using MimeKit;
using MicroservicioNotificaciones.Configuration;
using MicroservicioNotificaciones.Entities;
using MicroservicioNotificaciones.Repository;
using MicroservicioNotificaciones.Services.Clients;

namespace MicroservicioNotificaciones.Services
{
    public class NotificacionesService : INotificacionesService
    {
        private const string ParamPagSize = "PAGSIZE";
        private const int TamanoPaginaDefecto = 15;

        private readonly IConfiguration _configuration;
        private readonly INotificacionesRepository _repository;
        private readonly IAuthServiceValidator _authValidator;
        private readonly IBitacoraServiceClient _bitacoraClient;
        private readonly IValidator<NotificarRequest> _validator;
        private readonly IValidator<NotificarMultipleRequest> _multipleValidator;
        private readonly IParametroServiceClient _parametroClient;

        public NotificacionesService(
            IConfiguration configuration,
            INotificacionesRepository repository,
            IAuthServiceValidator authValidator,
            IBitacoraServiceClient bitacoraClient,
            IValidator<NotificarRequest> validator,
            IValidator<NotificarMultipleRequest> multipleValidator,
            IParametroServiceClient parametroClient)
        {
            _configuration = configuration;
            _repository = repository;
            _authValidator = authValidator;
            _bitacoraClient = bitacoraClient;
            _validator = validator;
            _multipleValidator = multipleValidator;
            _parametroClient = parametroClient;
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
            {
                var mensaje = string.Join("; ", validationResult.Errors.Select(e => e.ErrorMessage));
                throw new ArgumentException(mensaje);
            }

            var smtp = await ResolverSmtpSettingsAsync(usuario, token);

            return await EnviarCorreoInternoAsync(usuario, token, request.Email, request.Asunto, request.Cuerpo, smtp);
        }

        public async Task<NotificarMultipleResponse> EnviarCorreosMultiplesAsync(
            NotificarMultipleRequest request,
            HttpRequest httpRequest)
        {
            var (usuario, token, error) = await _authValidator.ValidarAsync(httpRequest);

            if (error is not null)
                throw new UnauthorizedAccessException("No autorizado");

            var validationResult = await _multipleValidator.ValidateAsync(request);

            if (!validationResult.IsValid)
            {
                var mensaje = string.Join("; ", validationResult.Errors.Select(e => e.ErrorMessage));
                throw new ArgumentException(mensaje);
            }

            var smtp = await ResolverSmtpSettingsAsync(usuario, token);
            var respuesta = new NotificarMultipleResponse();

            var correosUnicos = request.Emails
                .Select(e => e.Trim())
                .Where(e => !string.IsNullOrWhiteSpace(e))
                .Distinct(StringComparer.OrdinalIgnoreCase)
                .ToList();

            foreach (var email in correosUnicos)
            {
                try
                {
                    var res = await EnviarCorreoInternoAsync(usuario, token, email, request.Asunto, request.Cuerpo, smtp);
                    respuesta.Resultados.Add(res);
                    respuesta.TotalEnviados++;
                }
                catch (Exception ex)
                {
                    respuesta.Resultados.Add(new NotificarResponse
                    {
                        Email = email,
                        Asunto = request.Asunto,
                        Cuerpo = request.Cuerpo,
                        Estado = "ERROR",
                        Mensaje = ex.Message,
                        FechaEnvio = DateTime.UtcNow
                    });
                    respuesta.TotalFallidos++;
                }
            }

            try
            {
                await _bitacoraClient.RegistrarBitacoraAsync(
                    usuario,
                    $"Envío múltiple de notificaciones: {respuesta.TotalEnviados} enviado(s), {respuesta.TotalFallidos} fallido(s). Asunto: {request.Asunto}",
                    token);
            }
            catch
            {
                // Ignorar fallo de bitácora
            }

            return respuesta;
        }

        public async Task<object> ObtenerHistorialAsync(int? pagina, HttpRequest httpRequest)
        {
            var (usuario, token, error) = await _authValidator.ValidarAsync(httpRequest);

            if (error is not null)
                throw new UnauthorizedAccessException("No autorizado");

            if (pagina.HasValue && pagina.Value < 1)
                throw new ArgumentException("La página debe ser mayor o igual a 1");

            var todos = (await _repository.ObtenerTodosAsync()).ToList();

            try
            {
                var descripcionBitacora = pagina.HasValue
                    ? $"Consulta de historial de notificaciones enviadas (página {pagina.Value})"
                    : "Consulta de historial de notificaciones enviadas (lista completa)";

                await _bitacoraClient.RegistrarBitacoraAsync(usuario, descripcionBitacora, token);
            }
            catch
            {
                // Ignorar fallo de bitácora
            }

            if (!pagina.HasValue)
            {
                return todos;
            }

            var tamano = await ObtenerTamanoPaginaAsync(usuario, token);
            var paginaActual = pagina.Value;
            var totalRegistros = todos.Count;
            var totalPaginas = (int)Math.Ceiling((double)totalRegistros / tamano);

            var datos = todos
                .Skip((paginaActual - 1) * tamano)
                .Take(tamano)
                .ToList();

            return new PaginaResultado<NotificacionHistorialResponse>
            {
                Pagina = paginaActual,
                TamanoPagina = tamano,
                TotalRegistros = totalRegistros,
                TotalPaginas = totalPaginas,
                Datos = datos
            };
        }

        private async Task<int> ObtenerTamanoPaginaAsync(Guid usuarioId, string token)
        {
            try
            {
                var valor = await _parametroClient.ObtenerValorAsync(ParamPagSize, usuarioId, token);
                if (!string.IsNullOrWhiteSpace(valor) && int.TryParse(valor, out var n) && n > 0)
                {
                    return n;
                }
            }
            catch
            {
                // Ignorar fallo y usar default
            }

            return TamanoPaginaDefecto;
        }

        private async Task<NotificarResponse> EnviarCorreoInternoAsync(
            Guid usuario,
            string token,
            string email,
            string asunto,
            string cuerpo,
            SmtpSettings smtp)
        {
            try
            {
                var parametrosJson = JsonSerializer.Serialize(new
                {
                    Asunto = asunto,
                    Cuerpo = cuerpo
                });

                var notificacion = await _repository.CrearAsync(usuario, email, parametrosJson);

                try
                {
                    var message = new MimeMessage();

                    message.From.Add(new MailboxAddress(smtp.FromName, smtp.From));
                    message.To.Add(MailboxAddress.Parse(email));
                    message.Subject = asunto;
                    message.Body = new BodyBuilder { HtmlBody = cuerpo }.ToMessageBody();

                    using var client = new SmtpClient();

                    await client.ConnectAsync(smtp.Host, smtp.Port,
                        smtp.EnableSsl ? SecureSocketOptions.StartTls : SecureSocketOptions.None);

                    await client.AuthenticateAsync(smtp.User, smtp.Password);
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
                            $"Se envió notificación a {email}. Asunto: {asunto}",
                            token);
                    }
                    catch
                    {
                        // No falla la operación principal si la bitácora falla
                    }

                    return new NotificarResponse
                    {
                        Email = email,
                        Asunto = asunto,
                        Cuerpo = cuerpo,
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
            catch (Exception ex) when (ex is not UnauthorizedAccessException && ex is not ArgumentException)
            {
                try
                {
                    await _bitacoraClient.RegistrarBitacoraAsync(
                        usuario,
                        $"Error técnico al enviar notificación a {email}",
                        token);
                }
                catch
                {
                    // Ignorar fallo de bitácora
                }

                throw;
            }
        }

        private async Task<SmtpSettings> ResolverSmtpSettingsAsync(Guid usuarioId, string token)
        {
            var hostCode = _configuration["ParametrosSmtp:HostCode"] ?? "SMTPHOST";
            var portCode = _configuration["ParametrosSmtp:PortCode"] ?? "SMTPPORT";
            var userCode = _configuration["ParametrosSmtp:UserCode"] ?? "SMTPUSER";
            var passCode = _configuration["ParametrosSmtp:PasswordCode"] ?? "SMTPPASS";
            var fromCode = _configuration["ParametrosSmtp:FromCode"] ?? "SMTPFROM";
            var nameCode = _configuration["ParametrosSmtp:FromNameCode"] ?? "SMTPNAME";
            var sslCode = _configuration["ParametrosSmtp:EnableSslCode"] ?? "SMTPSSL";

            var host = await _parametroClient.ObtenerValorAsync(hostCode, usuarioId, token);
            if (string.IsNullOrWhiteSpace(host))
                throw new InvalidOperationException($"El parámetro '{hostCode}' (Host SMTP) no está configurado en MicroservicioParametros.");

            var user = await _parametroClient.ObtenerValorAsync(userCode, usuarioId, token);
            if (string.IsNullOrWhiteSpace(user))
                throw new InvalidOperationException($"El parámetro '{userCode}' (Usuario SMTP) no está configurado en MicroservicioParametros.");

            var pass = await _parametroClient.ObtenerValorAsync(passCode, usuarioId, token);
            if (string.IsNullOrWhiteSpace(pass))
                throw new InvalidOperationException($"El parámetro '{passCode}' (Contraseña SMTP) no está configurado en MicroservicioParametros.");

            var from = await _parametroClient.ObtenerValorAsync(fromCode, usuarioId, token);
            if (string.IsNullOrWhiteSpace(from))
                throw new InvalidOperationException($"El parámetro '{fromCode}' (Remitente SMTP) no está configurado en MicroservicioParametros.");

            var portStr = await _parametroClient.ObtenerValorAsync(portCode, usuarioId, token);
            var port = int.TryParse(portStr, out var p) && p > 0 ? p : 587;

            var name = await _parametroClient.ObtenerValorAsync(nameCode, usuarioId, token);
            var fromName = !string.IsNullOrWhiteSpace(name) ? name : from;

            var sslStr = await _parametroClient.ObtenerValorAsync(sslCode, usuarioId, token);
            var enableSsl = !bool.TryParse(sslStr, out var s) || s;

            return new SmtpSettings
            {
                Host = host,
                Port = port,
                User = user,
                Password = pass,
                From = from,
                FromName = fromName,
                EnableSsl = enableSsl
            };
        }
    }
}
