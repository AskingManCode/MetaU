using FluentValidation;

namespace MicroservicioPagos.Entities
{
    public class ReversarPagoRequestValidator : AbstractValidator<ReversarPagoRequest>
    {
        public ReversarPagoRequestValidator()
        {
            RuleFor(x => x.Motivo)
                .NotEmpty().WithMessage("El motivo de reversión es obligatorio.")
                .MaximumLength(250).WithMessage("El motivo de reversión no puede superar los 250 caracteres.")
                .Must(m => !string.IsNullOrWhiteSpace(m)).WithMessage("El motivo de reversión no puede contener solo espacios.");
        }
    }
}
