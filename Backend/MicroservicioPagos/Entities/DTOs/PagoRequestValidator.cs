using FluentValidation;

namespace MicroservicioPagos.Entities.DTOs
{
    public class PagoRequestValidator : AbstractValidator<PagoRequest>
    {
        public PagoRequestValidator()
        {
            RuleFor(request => request.FacturaID)
                .NotEmpty().WithMessage("La factura es obligatoria.");
        }
    }
}
