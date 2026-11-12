using FluentValidation;

namespace MicroservicioNotificaciones.Entities
{
    public class NotificarMultipleRequestValidator : AbstractValidator<NotificarMultipleRequest>
    {
        private const string EmailRegex = @"^[^@.\s][^@\s]*@[^@.\s][^@\s]*\.[^@.\s]+$";

        public NotificarMultipleRequestValidator()
        {
            RuleFor(x => x.Emails)
                .NotEmpty().WithMessage("Debe especificar al menos un correo de destino.")
                .Must(e => e != null && e.Count > 0).WithMessage("La lista de correos no puede estar vacía.");

            RuleForEach(x => x.Emails)
                .NotEmpty().WithMessage("El correo no puede estar vacío.")
                .MinimumLength(7).WithMessage("Cada correo debe tener al menos 7 caracteres.")
                .MaximumLength(150).WithMessage("Cada correo no puede superar los 150 caracteres.")
                .EmailAddress().WithMessage("Formato de correo inválido.")
                .Matches(EmailRegex).WithMessage("El correo contiene caracteres o una estructura no permitida.")
                .Must(e => !e.Contains("..")).WithMessage("El correo no puede contener puntos consecutivos.");

            RuleFor(x => x.Asunto)
                .NotEmpty().WithMessage("El asunto es obligatorio.")
                .MaximumLength(200).WithMessage("El asunto no puede superar los 200 caracteres.");

            RuleFor(x => x.Cuerpo)
                .NotEmpty().WithMessage("El cuerpo de la notificación es obligatorio.");
        }
    }
}
