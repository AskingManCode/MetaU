using FluentValidation;

namespace MicroservicioNotificaciones.Entities
{
    public class NotificarRequestValidator : AbstractValidator<NotificarRequest>
    {
        // Regex espejo de la constraint CH_Notificaciones_EmailDestino_Formato:
        //  - mínimo 7 caracteres
        //  - sin espacios
        //  - no empieza ni termina con . ni @
        //  - exactamente un @, con al menos un carácter antes y después
        //  - al menos un punto después del @
        //  - sin ".."
        private const string EmailRegex =
            @"^[^@.\s][^@\s]*@[^@.\s][^@\s]*\.[^@.\s]+$";

        public NotificarRequestValidator()
        {
            RuleFor(x => x.Email)
                .NotEmpty()
                    .WithMessage("El correo de destino es obligatorio.")
                .MinimumLength(7)
                    .WithMessage("El correo debe tener al menos 7 caracteres.")
                .MaximumLength(150)
                    .WithMessage("El correo no puede superar los 150 caracteres.")
                .EmailAddress()
                    .WithMessage("El correo no tiene un formato válido.")
                .Matches(EmailRegex)
                    .WithMessage("El correo contiene caracteres o una estructura no permitida.")
                .Must(e => !e.Contains(".."))
                    .WithMessage("El correo no puede contener puntos consecutivos.");

            RuleFor(x => x.Asunto)
                .NotEmpty()
                    .WithMessage("El asunto es obligatorio.")
                .MaximumLength(200)
                    .WithMessage("El asunto no puede superar los 200 caracteres.");

            RuleFor(x => x.Cuerpo)
                .NotEmpty()
                    .WithMessage("El cuerpo de la notificación es obligatorio.");
        }
    }
}