
using MicroservicioGrupos.Entities;
using MicroservicioGrupos.Repository;

namespace MicroservicioGrupos.Services
{
    public class GrupoService : IGrupoService
    {
        private const string ParametroPaginacion = "PAGSIZE";
        private const int TamanoPaginaDefecto = 15;

        private readonly IGrupoRepository _repository;
        private readonly IParametroServiceClient _parametros;
        private readonly ILogger<GrupoService> _logger;

        public GrupoService(IGrupoRepository repository, IParametroServiceClient parametros, ILogger<GrupoService> logger)
        {
            _repository = repository;
            _parametros = parametros;
            _logger = logger;
        }

        public async Task CrearAsync(Grupo grupo)
        {
            var existente = await _repository.ObtenerPorIdAsync(grupo.GrupoCode);

            if (existente is not null)
                throw new InvalidOperationException("El grupo ya existe");

            ValidarGrupo(grupo);
            await _repository.CrearAsync(grupo);
        }

        public async Task<Grupo> ModificarAsync(Grupo grupo)
        {
            var anterior = await ObtenerPorIdAsync(grupo.GrupoCode);
            grupo.Estado = anterior.Estado;

            ValidarGrupo(grupo);
            await _repository.ModificarAsync(grupo);

            return anterior;
        }

        public async Task<Grupo> EliminarAsync(string grupoCode)
        {
            var grupo = await ObtenerPorIdAsync(grupoCode);
            await _repository.EliminarAsync(grupoCode);
            return grupo;
        }

        public Task<IEnumerable<Grupo>> ObtenerTodosAsync()
        {
            return _repository.ObtenerTodosAsync();
        }

        public async Task<PaginaResultado<Grupo>> ObtenerPaginadoAsync(int pagina, Guid usuario, string token)
        {
            if (pagina < 1)
                throw new ArgumentException("La pagina debe ser mayor o igual a 1");

            var tamano = TamanoPaginaDefecto;

            try
            {
                var valor = await _parametros.ObtenerValorAsync(ParametroPaginacion, usuario, token);

                if (int.TryParse(valor, out var configurado) && configurado > 0)
                    tamano = Math.Min(configurado, TamanoPaginaDefecto);

                _logger.LogInformation("Paginacion de grupos: PAGSIZE={Valor}, tamano aplicado={Tamano}", valor ?? "No disponible", tamano);
            }
            catch (HttpRequestException ex)
            {
                _logger.LogWarning(ex, "No se pudo consultar PAGSIZE. Se utilizara el valor por defecto");
            }
            catch (TaskCanceledException ex)
            {
                _logger.LogWarning(ex, "Tiempo de espera agotado al consultar PAGSIZE. Se utilizara el valor por defecto");
            }

            var grupos = (await _repository.ObtenerTodosAsync())
                .OrderBy(g => g.GrupoCode, StringComparer.Ordinal)
                .ToList();

            var inicio = ((long)pagina - 1) * tamano;

            var datos = inicio >= grupos.Count
                ? new List<Grupo>()
                : grupos.Skip((int)inicio).Take(tamano).ToList();

            return new PaginaResultado<Grupo>
            {
                Pagina = pagina,
                TamanoPagina = tamano,
                TotalRegistros = grupos.Count,
                TotalPaginas = (int)Math.Ceiling(grupos.Count / (double)tamano),
                Datos = datos
            };
        }

        public async Task<Grupo> ObtenerPorIdAsync(string grupoCode)
        {
            var grupo = await _repository.ObtenerPorIdAsync(grupoCode);

            if (grupo is null)
                throw new KeyNotFoundException("El grupo no existe");

            return grupo;
        }

        private static void ValidarGrupo(Grupo grupo)
        {
            if (string.IsNullOrWhiteSpace(grupo.GrupoCode))
                throw new ArgumentException("El identificador del grupo es requerido");

            if (grupo.NumeroGrupo == 0)
                throw new ArgumentException("El numero del grupo es requerido");

            if (string.IsNullOrWhiteSpace(grupo.CursoCode))
                throw new ArgumentException("El curso es requerido");

            if (grupo.ProfesorID == Guid.Empty)
                throw new ArgumentException("El profesor es requerido");

            if (string.IsNullOrWhiteSpace(grupo.Horario))
                throw new ArgumentException("El horario es requerido");

            if (grupo.Cupo == 0)
                throw new ArgumentException("El cupo es requerido");

            if (grupo.PeriodoID == Guid.Empty)
                throw new ArgumentException("El periodo es requerido");
        }
    }
}
