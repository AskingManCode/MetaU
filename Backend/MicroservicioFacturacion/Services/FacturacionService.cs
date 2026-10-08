using MicroservicioFacturacion.Entities;
using MicroservicioFacturacion.Repository;
using MicroservicioFacturacion.Services.Clients;

namespace MicroservicioFacturacion.Services
{
    public class FacturacionService : IFacturacionService
    {
        private readonly IFacturacionRepository _repository;
        private readonly IMatriculaServiceClient _matriculaClient;

        public FacturacionService(IFacturacionRepository repository, IMatriculaServiceClient matriculaClient)
        {
            _repository = repository;
            _matriculaClient = matriculaClient;
        }

        public async Task<FacturaResponse> CrearAsync(
            FacturacionRequest request, Guid usuarioId, string token)
        {
            var matriculas = await _matriculaClient.ObtenerPorEstudianteAsync(request.IdentificacionEstudiante.Trim(), usuarioId, token);

            var elegibles = matriculas
                .Where(matricula => request.PeriodoID is null || matricula.PeriodoID == request.PeriodoID)
                .DistinctBy(matricula => matricula.MatriculaID)
                .ToList();

            if (elegibles.Count == 0)
                throw new KeyNotFoundException("No existe una matrícula para el estudiante y periodo indicados.");

            if (elegibles.Count > 1)
                throw new InvalidOperationException("El estudiante tiene varias matrículas; indique el PeriodoID para elegir una.");

            var matricula = elegibles[0];
            var facturaId = await _repository.CrearAsync(
                request.IdentificacionEstudiante.Trim(),
                matricula.MatriculaID,
                matricula.PeriodoID,
                request.Monto);
            var factura = await _repository.ObtenerPorIdAsync(facturaId)
                ?? throw new InvalidOperationException("No se pudo recuperar la factura recién creada.");

            return CrearRespuesta(factura);
        }

        public async Task<FacturaResponse> AnularAsync(Guid facturaId)
        {
            if (!await _repository.AnularAsync(facturaId))
            {
                var facturaExistente = await _repository.ObtenerPorIdAsync(facturaId);

                if (facturaExistente is null)
                    throw new KeyNotFoundException("No existe una factura con el identificador indicado.");

                throw new InvalidOperationException("La factura ya está anulada.");
            }

            var factura = await _repository.ObtenerPorIdAsync(facturaId)
                ?? throw new InvalidOperationException("No se pudo recuperar la factura anulada.");

            return CrearRespuesta(factura);
        }

        public async Task<FacturaResponse?> ObtenerPorIdAsync(Guid facturaId)
        {
            var factura = await _repository.ObtenerPorIdAsync(facturaId);
            return factura is null ? null : CrearRespuesta(factura);
        }

        public async Task<IEnumerable<FacturaResponse>> ObtenerPorPeriodoAsync(Guid periodoId)
        {
            var facturas = await _repository.ObtenerPorPeriodoAsync(periodoId);
            return facturas
                .GroupBy(factura => factura.FacturaID)
                .Select(grupo => CrearRespuesta(
                    grupo.First(),
                    grupo.Where(factura => factura.DetalleFacturaID.HasValue)));
        }

        private static FacturaResponse CrearRespuesta(
            Factura factura,
            IEnumerable<Factura>? filas = null)
        {
            var detalles = filas is null
                ? factura.DetalleFacturaID.HasValue
                    ? new List<DetalleFacturaResponse>
                    {
                        new()
                        {
                            DetalleFacturaID = factura.DetalleFacturaID.Value,
                            Descripcion = factura.Descripcion!,
                            CursoCode = factura.CursoCode,
                            Monto = factura.MontoDetalle!.Value
                        }
                    }
                    : []
                : filas.Select(fila => new DetalleFacturaResponse
                {
                    DetalleFacturaID = fila.DetalleFacturaID!.Value,
                    Descripcion = fila.Descripcion!,
                    CursoCode = fila.CursoCode,
                    Monto = fila.MontoDetalle!.Value
                }).ToList();

            return new FacturaResponse
            {
                FacturaID = factura.FacturaID,
                EstudianteID = factura.EstudianteID,
                MatriculaID = factura.MatriculaID,
                PeriodoID = factura.PeriodoID,
                Estado = factura.Estado,
                FechaEmision = factura.FechaEmision,
                FechaAnulacion = factura.FechaAnulacion,
                Subtotal = factura.Subtotal,
                PorcentajeImpuesto = factura.PorcentajeImpuesto,
                Impuesto = factura.Impuesto,
                Total = factura.Total,
                Detalles = detalles
            };
        }
    }
}
