using FluentValidation;
using MicroservicioFacturacion.Entities;

namespace MicroservicioFacturacion.Validators
{
    public class FacturacionRequestValidator : AbstractValidator<FacturacionRequest>
    {
        private const decimal MontoMinimo = 30000m;

        public FacturacionRequestValidator()
        {
            RuleFor(x => x.EstudianteIdentificacion)
                .NotEmpty().WithMessage("La identificación del estudiante es obligatoria.")
                .MaximumLength(30).WithMessage("La identificación no puede superar los 30 caracteres.")
                .Must(id => !string.IsNullOrWhiteSpace(id)).WithMessage("La identificación no puede contener solo espacios.");

            RuleFor(x => x.Monto)
                .GreaterThan(0).WithMessage("El monto debe ser mayor que cero.")
                .Must(monto => monto % MontoMinimo == 0)
                    .WithMessage($"El monto debe ser un múltiplo de {MontoMinimo} colones.");

            RuleFor(x => x.PeriodoID)
                .NotEmpty().WithMessage("El identificador del periodo es obligatorio.")
                .Must(id => id != Guid.Empty).WithMessage("El identificador del periodo no puede ser vacío.");
        }
    }
}