using FluentValidation;
using MicroservicioParametros.Entities;

namespace MicroservicioParametros.Validators
{
    public class ParametrosRequestValidator : AbstractValidator<ParametroRequest>
    {
        public ParametrosRequestValidator()
        {
            RuleFor(x => x.ParametroCode)
                .NotEmpty().WithMessage("El código del parámetro es obligatorio.")
                .MaximumLength(10).WithMessage("El código del parámetro no puede tener más de 10 caracteres.")
                .Matches("^[A-Z]+$").WithMessage("El código del parámetro solo puede contener letras mayúsculas.");

            RuleFor(x => x.Valor)
                .NotEmpty().WithMessage("El valor del parámetro es obligatorio.")
                .MaximumLength(500).WithMessage("El valor no puede tener más de 500 caracteres.");
        }
    }
}