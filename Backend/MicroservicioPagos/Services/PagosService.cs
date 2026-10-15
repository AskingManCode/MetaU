using MicroservicioPagos.Entities;
using MicroservicioPagos.Repository;
using MicroservicioPagos.Services.Clients;

namespace MicroservicioPagos.Services
{
    public class PagosService : IPagosService
    {
        private readonly IPagosRepository _repository;
        private readonly IAuthServiceValidator _authValidator;
        private readonly IBitacoraServiceClient _bitacoraClient;

        public PagosService(
            IPagosRepository repository,
            IAuthServiceValidator authValidator,
            IBitacoraServiceClient bitacoraClient)
        {
            _repository = repository;
            _authValidator = authValidator;
            _bitacoraClient = bitacoraClient;
        }

        public async Task<PagoResponse> CrearAsync(Guid facturaId, HttpRequest httpRequest)
        {
            var (usuario, token, error) = await _authValidator.ValidarAsync(httpRequest);

            if (error is not null)
                throw new UnauthorizedAccessException("No autorizado");

            if (facturaId == Guid.Empty)
                throw new ArgumentException("El identificador de la factura es obligatorio.");

            try
            {
                var pagoId = await _repository.CrearAsync(facturaId);

                var pago = await _repository.ObtenerPorIdAsync(pagoId)
                    ?? throw new InvalidOperationException("No se pudo recuperar el pago recién creado.");

                try
                {
                    await _bitacoraClient.RegistrarBitacoraAsync(
                        usuario,
                        $"Se registró el pago {pago.PagoID} de la factura {facturaId}.",
                        token);
                }
                catch { }

                return pago;
            }
            catch (Exception ex) when (ex is not UnauthorizedAccessException)
            {
                try
                {
                    await _bitacoraClient.RegistrarBitacoraAsync(
                        usuario,
                        $"Error al registrar el pago de la factura {facturaId}: {ex.Message}",
                        token);
                }
                catch { }

                throw;
            }
        }

        public async Task<PagoResponse> ReversarAsync(Guid pagoId, HttpRequest httpRequest)
        {
            var (usuario, token, error) = await _authValidator.ValidarAsync(httpRequest);

            if (error is not null)
                throw new UnauthorizedAccessException("No autorizado");

            try
            {
                var pago = await _repository.ReversarAsync(pagoId);

                if (pago is null)
                {
                    var existente = await _repository.ObtenerPorIdAsync(pagoId);
                    if (existente is null)
                        throw new KeyNotFoundException("No existe un pago con el identificador indicado.");

                    throw new InvalidOperationException("El pago ya está reversado.");
                }

                try
                {
                    await _bitacoraClient.RegistrarBitacoraAsync(
                        usuario,
                        $"Se reversó el pago {pagoId}.",
                        token);
                }
                catch { }

                return pago;
            }
            catch (Exception ex) when (ex is not UnauthorizedAccessException)
            {
                try
                {
                    await _bitacoraClient.RegistrarBitacoraAsync(
                        usuario,
                        $"Error al reversar el pago {pagoId}: {ex.Message}",
                        token);
                }
                catch { }

                throw;
            }
        }

        public async Task<PagoResponse?> ObtenerPorIdAsync(Guid pagoId, HttpRequest httpRequest)
        {
            var (usuario, token, error) = await _authValidator.ValidarAsync(httpRequest);

            if (error is not null)
                throw new UnauthorizedAccessException("No autorizado");

            try
            {
                var pago = await _repository.ObtenerPorIdAsync(pagoId);

                try
                {
                    await _bitacoraClient.RegistrarBitacoraAsync(
                        usuario,
                        $"Consulta del pago {pagoId}.",
                        token);
                }
                catch { }

                return pago;
            }
            catch (Exception ex) when (ex is not UnauthorizedAccessException)
            {
                try
                {
                    await _bitacoraClient.RegistrarBitacoraAsync(
                        usuario,
                        $"Error al consultar el pago {pagoId}: {ex.Message}",
                        token);
                }
                catch { }

                throw;
            }
        }

        public async Task<IEnumerable<PagoResponse>> ObtenerPorPeriodoAsync(Guid periodoId, HttpRequest httpRequest)
        {
            var (usuario, token, error) = await _authValidator.ValidarAsync(httpRequest);

            if (error is not null)
                throw new UnauthorizedAccessException("No autorizado");

            try
            {
                var pagos = await _repository.ObtenerPorPeriodoAsync(periodoId);

                try
                {
                    await _bitacoraClient.RegistrarBitacoraAsync(
                        usuario,
                        $"Consulta de pagos del periodo {periodoId}.",
                        token);
                }
                catch { }

                return pagos;
            }
            catch (Exception ex) when (ex is not UnauthorizedAccessException)
            {
                try
                {
                    await _bitacoraClient.RegistrarBitacoraAsync(
                        usuario,
                        $"Error al consultar pagos del periodo {periodoId}: {ex.Message}",
                        token);
                }
                catch { }

                throw;
            }
        }
    }
}
