using FluentValidation;
using MicroservicioFacturacion.Entities;
using MicroservicioFacturacion.Repository;
using MicroservicioFacturacion.Services.Clients;

namespace MicroservicioFacturacion.Services
{
    public class FacturacionService : IFacturacionService
    {
        private readonly IFacturacionRepository _repository;
        private readonly IMatriculaServiceClient _matriculaClient;
        private readonly IPeriodoServiceClient _periodoClient;
        private readonly IAuthServiceValidator _authValidator;
        private readonly IBitacoraServiceClient _bitacoraClient;
        private readonly IValidator<FacturacionRequest> _validator;

        private const decimal MontoPorCurso = 30000m;
        private const string DescripcionDetalle = "Servicios estudiantiles";

        public FacturacionService(
            IFacturacionRepository repository,
            IMatriculaServiceClient matriculaClient,
            IPeriodoServiceClient periodoClient,
            IAuthServiceValidator authValidator,
            IBitacoraServiceClient bitacoraClient,
            IValidator<FacturacionRequest> validator)
        {
            _repository = repository;
            _matriculaClient = matriculaClient;
            _periodoClient = periodoClient;
            _authValidator = authValidator;
            _bitacoraClient = bitacoraClient;
            _validator = validator;
        }

        public async Task<FacturaResponse> CrearAsync(FacturacionRequest request, HttpRequest httpRequest)
        {
            var (usuario, token, error) = await _authValidator.ValidarAsync(httpRequest);

            if (error is not null)
                throw new UnauthorizedAccessException("No autorizado");

            var validationResult = await _validator.ValidateAsync(request);

            if (!validationResult.IsValid)
            {
                var mensaje = string.Join("; ", validationResult.Errors.Select(e => e.ErrorMessage));
                throw new ArgumentException(mensaje);
            }

            try
            {
                var periodoValido = await _periodoClient.ObtenerPorIdAsync(request.PeriodoID, usuario, token);

                if (!periodoValido)
                    throw new KeyNotFoundException("El periodo indicado no existe o no está activo.");

                var matriculas = await _matriculaClient.ObtenerPorEstudianteAsync(
                    request.EstudianteIdentificacion.Trim(), usuario, token);

                var cursosDelPeriodo = matriculas
                    .Where(m => m.PeriodoID == request.PeriodoID)
                    .ToList();

                if (cursosDelPeriodo.Count == 0)
                    throw new KeyNotFoundException("No se encontró una matrícula activa para el estudiante en el periodo indicado.");

                var montoEsperado = cursosDelPeriodo.Count * MontoPorCurso;

                if (request.Monto != montoEsperado)
                    throw new ArgumentException($"El monto debe ser {montoEsperado} colones para los {cursosDelPeriodo.Count} cursos matriculados.");

                var matricula = cursosDelPeriodo.First();

                var detalles = cursosDelPeriodo
                    .Select(c => (c.CursoCode, DescripcionDetalle, MontoPorCurso))
                    .ToList();

                var facturaId = await _repository.CrearConDetallesAsync(
                    request.EstudianteIdentificacion.Trim(),
                    matricula.MatriculaID,
                    request.PeriodoID,
                    request.Monto,
                    detalles);

                var factura = await _repository.ObtenerPorIdAsync(facturaId)
                    ?? throw new InvalidOperationException("No se pudo recuperar la factura recién creada.");

                try
                {
                    await _bitacoraClient.RegistrarBitacoraAsync(
                        usuario,
                        $"Se creó la factura {factura.FacturaID}: {System.Text.Json.JsonSerializer.Serialize(factura)}",
                        token);
                }
                catch
                {
                    // Mejor esfuerzo: no fallar la operación principal
                }

                return factura;
            }
            catch (Exception ex) when (ex is not UnauthorizedAccessException)
            {
                try
                {
                    await _bitacoraClient.RegistrarBitacoraAsync(
                        usuario,
                        $"Error al crear factura para {request.EstudianteIdentificacion}: {ex.Message}",
                        token);
                }
                catch
                {
                    // Ignorar fallo de bitácora
                }

                throw;
            }
        }

        public async Task<FacturaResponse> AnularAsync(Guid facturaId, HttpRequest httpRequest)
        {
            var (usuario, token, error) = await _authValidator.ValidarAsync(httpRequest);

            if (error is not null)
                throw new UnauthorizedAccessException("No autorizado");

            try
            {
                var existente = await _repository.ObtenerPorIdAsync(facturaId);

                if (existente is null)
                    throw new KeyNotFoundException($"No se encontró la factura '{facturaId}'.");

                if (existente.Estado.Equals("ANUL", StringComparison.OrdinalIgnoreCase) ||
                    existente.FechaAnulacion.HasValue)
                {
                    throw new InvalidOperationException("La factura ya se encuentra anulada.");
                }

                // Llamamos al SP (puede devolver -1 por SET NOCOUNT ON)
                await _repository.AnularAsync(facturaId);

                // Verificamos el estado real después de la operación
                var factura = await _repository.ObtenerPorIdAsync(facturaId)
                    ?? throw new InvalidOperationException("No se pudo recuperar la factura después de anular.");

                if (!factura.FechaAnulacion.HasValue &&
                    !factura.Estado.Equals("ANUL", StringComparison.OrdinalIgnoreCase))
                {
                    throw new InvalidOperationException("No se pudo anular la factura.");
                }

                try
                {
                    await _bitacoraClient.RegistrarBitacoraAsync(
                        usuario,
                        $"Se anuló la factura {factura.FacturaID}",
                        token);
                }
                catch
                {
                    // Mejor esfuerzo
                }

                return factura;
            }
            catch (Exception ex) when (ex is not UnauthorizedAccessException)
            {
                try
                {
                    await _bitacoraClient.RegistrarBitacoraAsync(
                        usuario,
                        $"Error al anular factura {facturaId}: {ex.Message}",
                        token);
                }
                catch { }

                throw;
            }
        }

        public async Task<FacturaResponse?> ObtenerPorIdAsync(Guid facturaId, HttpRequest httpRequest)
        {
            var (usuario, token, error) = await _authValidator.ValidarAsync(httpRequest);

            if (error is not null)
                throw new UnauthorizedAccessException("No autorizado");

            try
            {
                var factura = await _repository.ObtenerPorIdAsync(facturaId);

                try
                {
                    await _bitacoraClient.RegistrarBitacoraAsync(
                        usuario,
                        $"Consulta de factura {facturaId}",
                        token);
                }
                catch { }

                return factura;
            }
            catch (Exception ex) when (ex is not UnauthorizedAccessException)
            {
                try
                {
                    await _bitacoraClient.RegistrarBitacoraAsync(
                        usuario,
                        $"Error al consultar factura {facturaId}: {ex.Message}",
                        token);
                }
                catch { }

                throw;
            }
        }

        public async Task<IEnumerable<FacturaResponse>> ObtenerPorPeriodoAsync(Guid periodoId, HttpRequest httpRequest)
        {
            var (usuario, token, error) = await _authValidator.ValidarAsync(httpRequest);

            if (error is not null)
                throw new UnauthorizedAccessException("No autorizado");

            try
            {
                var facturas = await _repository.ObtenerPorPeriodoAsync(periodoId);

                try
                {
                    await _bitacoraClient.RegistrarBitacoraAsync(
                        usuario,
                        $"Consulta de facturas del periodo {periodoId}",
                        token);
                }
                catch { }

                return facturas;
            }
            catch (Exception ex) when (ex is not UnauthorizedAccessException)
            {
                try
                {
                    await _bitacoraClient.RegistrarBitacoraAsync(
                        usuario,
                        $"Error al consultar facturas del periodo {periodoId}: {ex.Message}",
                        token);
                }
                catch { }

                throw;
            }
        }
    }
}
