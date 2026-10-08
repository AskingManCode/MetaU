using FluentValidation;

namespace MicroservicioFacturacion.Entities
{
    public class FacturacionRequestValidator : AbstractValidator<FacturacionRequest>
    {
        private const decimal MontoCurso = 30000m;

        public FacturacionRequestValidator()
        {
            RuleFor(x => x.IdentificacionEstudiante)
                .NotEmpty().WithMessage("La identificación del estudiante es obligatoria.")
                .MaximumLength(50).WithMessage("La identificación no puede superar los 50 caracteres.");

            RuleFor(x => x.Monto)
                .GreaterThan(0).WithMessage("El monto debe ser mayor que cero.")
                .Must(m => m == MontoCurso).WithMessage($"El monto debe ser {MontoCurso} colones.");

            RuleFor(x => x.PeriodoID)
                .Must(periodoId => periodoId is null || periodoId != Guid.Empty)
                .WithMessage("El periodo no puede ser vacío.");
        }
    }
}
