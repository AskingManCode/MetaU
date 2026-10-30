
using MicroservicioPeriodos.Entities;
using MicroservicioPeriodos.Repository;

namespace MicroservicioPeriodos.Services
{
    public class PeriodoService : IPeriodoService
    {
        private const string ParametroPaginacion = "PAGSIZE";
        private const int TamanoPaginaDefecto = 15;

        private readonly IPeriodoRepository _repository;
        private readonly IParametroServiceClient _parametros;
        private readonly ILogger<PeriodoService> _logger;

        public PeriodoService(IPeriodoRepository repository, IParametroServiceClient parametros, ILogger<PeriodoService> logger)
        {
            _repository = repository;
            _parametros = parametros;
            _logger = logger;
        }

        public async Task<Periodo> CrearAsync(Periodo periodo)
        {
            ValidarPeriodo(periodo);
            return await _repository.CrearAsync(periodo);
        }

        public async Task<Periodo> ModificarAsync(Periodo periodo)
        {
            var anterior = await ObtenerPorIdAsync(periodo.PeriodoID);
            periodo.Estado = anterior.Estado;

            ValidarPeriodo(periodo);
            await _repository.ModificarAsync(periodo);

            return anterior;
        }

        public async Task<Periodo> EliminarAsync(Guid periodoID)
        {
            var periodo = await ObtenerPorIdAsync(periodoID);
            await _repository.EliminarAsync(periodoID);
            return periodo;
        }

        public Task<IEnumerable<Periodo>> ObtenerTodosAsync()
        {
            return _repository.ObtenerTodosAsync();
        }

        public async Task<PaginaResultado<Periodo>> ObtenerPaginadoAsync(int pagina, Guid usuario, string token)
        {
            if (pagina < 1)
                throw new ArgumentException("La pagina debe ser mayor o igual a 1");

            var tamano = TamanoPaginaDefecto;

            try
            {
                var valor = await _parametros.ObtenerValorAsync(ParametroPaginacion, usuario, token);

                if (int.TryParse(valor, out var configurado) && configurado > 0)
                    tamano = Math.Min(configurado, TamanoPaginaDefecto);

                _logger.LogInformation("Paginacion de periodos: PAGSIZE={Valor}, tamano aplicado={Tamano}", valor ?? "No disponible", tamano);
            }
            catch (HttpRequestException ex)
            {
                _logger.LogWarning(ex, "No se pudo consultar PAGSIZE. Se utilizara el valor por defecto");
            }
            catch (TaskCanceledException ex)
            {
                _logger.LogWarning(ex, "Tiempo de espera agotado al consultar PAGSIZE. Se utilizara el valor por defecto");
            }

            var periodos = (await _repository.ObtenerTodosAsync())
                .OrderByDescending(p => p.Anio)
                .ThenBy(p => p.NumeroPeriodo)
                .ThenBy(p => p.PeriodoID)
                .ToList();

            var inicio = ((long)pagina - 1) * tamano;

            var datos = inicio >= periodos.Count
                ? new List<Periodo>()
                : periodos.Skip((int)inicio).Take(tamano).ToList();

            return new PaginaResultado<Periodo>
            {
                Pagina = pagina,
                TamanoPagina = tamano,
                TotalRegistros = periodos.Count,
                TotalPaginas = (int)Math.Ceiling(periodos.Count / (double)tamano),
                Datos = datos
            };
        }

        public async Task<Periodo> ObtenerPorIdAsync(Guid periodoID)
        {
            var periodo = await _repository.ObtenerPorIdAsync(periodoID);

            if (periodo == null)
                throw new KeyNotFoundException("El periodo no existe");

            return periodo;
        }

        private static void ValidarPeriodo(Periodo periodo)
        {
            if (periodo.Anio == 0)
                throw new ArgumentException("El anio es requerido");

            if (periodo.NumeroPeriodo == 0)
                throw new ArgumentException("El numero de periodo es requerido");

            if (periodo.FechaInicio == default)
                throw new ArgumentException("La fecha de inicio es requerida");

            if (periodo.FechaFin == default)
                throw new ArgumentException("La fecha de fin es requerida");

            if (periodo.FechaFin <= periodo.FechaInicio)
                throw new ArgumentException("La fecha de fin debe ser posterior a la fecha de inicio");
        }
    }
}
