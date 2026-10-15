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
                throw new UnauthorizedAccessException();

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
            
                var facturaId = await _repository.CrearAsync(
                    matricula.EstudianteID,
                    matricula.MatriculaID,
                    request.PeriodoID,
                    request.Monto);
                
                foreach (var curso in cursosDelPeriodo)
                {
                    await _repository.AgregarDetalleAsync(facturaId, curso.CursoCode, DescripcionDetalle, MontoPorCurso);
                }

                var factura = await _repository.ObtenerPorIdAsync(facturaId)
                    ?? throw new InvalidOperationException("No se pudo recuperar la factura recién creada.");
                
                try
                {
                    await _bitacoraClient.RegistrarBitacoraAsync(
                        usuario,
                        $"Se creó la factura {factura.FacturaID}: {System.Text.Json.JsonSerializer.Serialize(factura)}",
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
                        $"Error al crear factura para {request.EstudianteIdentificacion}: {ex.Message}",
                        token);
                }
                catch { }

                throw;
            }
        }

        // Los demás métodos los implementaremos después
        public Task<FacturaResponse> AnularAsync(Guid facturaId, HttpRequest httpRequest)
            => throw new NotImplementedException();

        public Task<FacturaResponse?> ObtenerPorIdAsync(Guid facturaId, HttpRequest httpRequest)
            => throw new NotImplementedException();

        public Task<IEnumerable<FacturaResponse>> ObtenerPorPeriodoAsync(Guid periodoId, HttpRequest httpRequest)
            => throw new NotImplementedException();
    }
}