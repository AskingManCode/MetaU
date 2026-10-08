using MicroservicioPagos.Entities;
using MicroservicioPagos.Entities.DTOs;
using MicroservicioPagos.Repository;

namespace MicroservicioPagos.Services
{
    public class PagosService : IPagosService
    {
        private readonly IPagosRepository _repository;

        public PagosService(IPagosRepository repository)
        {
            _repository = repository;
        }

        public async Task<PagoResponse> CrearAsync(PagoRequest request)
        {
            var pagoId = await _repository.CrearAsync(request.FacturaID);
            var pago = await _repository.ObtenerPorIDAsync(pagoId)
                ?? throw new InvalidOperationException("No se pudo recuperar el pago recién creado.");

            return CrearRespuesta(pago);
        }

        public async Task<PagoResponse> ReversarAsync(Guid pagoId)
        {
            var pago = await _repository.ReversarAsync(pagoId);
            if (pago is not null)
                return CrearRespuesta(pago);

            var existente = await _repository.ObtenerPorIDAsync(pagoId);
            if (existente is null)
                throw new KeyNotFoundException("No existe un pago con el identificador indicado.");

            throw new InvalidOperationException("El pago ya está reversado.");
        }

        public async Task<PagoResponse?> ObtenerPorIDAsync(Guid pagoId)
        {
            var pago = await _repository.ObtenerPorIDAsync(pagoId);
            return pago is null ? null : CrearRespuesta(pago);
        }

        public async Task<IEnumerable<PagoResponse>> ObtenerPorPeriodoAsync(Guid periodoId)
        {
            var pagos = await _repository.ObtenerPorPeriodoAsync(periodoId);
            return pagos.Select(CrearRespuesta);
        }

        private static PagoResponse CrearRespuesta(Pago pago) =>
            new()
            {
                PagoID = pago.PagoID,
                FacturaID = pago.FacturaID,
                Monto = pago.Monto,
                FechaPago = pago.FechaPago,
                FechaReversion = pago.FechaReversion,
                Estado = pago.Estado
            };
    }
}
