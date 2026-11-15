using FluentValidation;
using MicroservicioFacturacion.Entities;

namespace MicroservicioFacturacion.Validators
{
    public class AnularFacturaRequestValidator : AbstractValidator<AnularFacturaRequest>
    {
        public AnularFacturaRequestValidator()
        {
            RuleFor(x => x.Motivo)
                .NotEmpty().WithMessage("El motivo de anulación es obligatorio.")
                .MaximumLength(250).WithMessage("El motivo de anulación no puede superar los 250 caracteres.")
                .Must(m => !string.IsNullOrWhiteSpace(m)).WithMessage("El motivo de anulación no puede contener solo espacios.");
        }
    }
}
