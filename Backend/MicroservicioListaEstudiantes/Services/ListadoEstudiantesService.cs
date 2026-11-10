using MicroservicioListaEstudiantes.Entities;
using MicroservicioListaEstudiantes.Services.Clients;

namespace MicroservicioListaEstudiantes.Services
{
    public class ListadoEstudiantesService : IListadoEstudiantesService
    {
        private const string Items_Pagina = "PAGSIZE";
        private const int TamanoPaginaDefecto = 15;

        private readonly IGrupoServiceClient _grupoClient;
        private readonly IMatriculaServiceClient _matriculaClient;
        private readonly ICursoServiceClient _cursoClient;
        private readonly ICarreraServiceClient _carreraClient;
        private readonly IPeriodoServiceClient _periodoClient;
        private readonly IParametroServiceClient _parametroClient;

        public ListadoEstudiantesService(
            IGrupoServiceClient grupoClient,
            IMatriculaServiceClient matriculaClient,
            ICursoServiceClient cursoClient,
            ICarreraServiceClient carreraClient,
            IPeriodoServiceClient periodoClient,
            IParametroServiceClient parametroClient)
        {
            _grupoClient = grupoClient;
            _matriculaClient = matriculaClient;
            _cursoClient = cursoClient;
            _carreraClient = carreraClient;
            _periodoClient = periodoClient;
            _parametroClient = parametroClient;
        }

        public async Task<IEnumerable<EstudianteMatriculado>> ObtenerPorPeriodoAsync(
            string? periodo, string? carrera, string? curso, string? grupo,
            string? ordenarPor, string? direccion, Guid usuarioId, string token)
        {
            var todos = await ObtenerTodosDelPeriodoAsync(periodo, usuarioId, token);

            return Ordenar(Filtrar(todos, carrera, curso, grupo), ordenarPor, direccion).ToList();
        }

        public async Task<PaginaEstudiantes> ObtenerPaginadoAsync(
            string? periodo, string? carrera, string? curso, string? grupo,
            string? ordenarPor, string? direccion, int pagina, Guid usuarioId, string token)
        {
            if (pagina < 1)
                throw new ArgumentException("La pagina debe ser mayor o igual a 1");

            int tamano;
            try
            {
                var valor = await _parametroClient.ObtenerValorAsync(Items_Pagina, usuarioId, token);
                tamano = int.TryParse(valor, out var n) && n > 0 ? n : TamanoPaginaDefecto;
            }
            catch (HttpRequestException)
            {
                tamano = TamanoPaginaDefecto;
            }

            var todos = await ObtenerTodosDelPeriodoAsync(periodo, usuarioId, token);
            var filtrados = Ordenar(Filtrar(todos, carrera, curso, grupo), ordenarPor, direccion).ToList();

            return new PaginaEstudiantes
            {
                Pagina = pagina,
                TamanoPagina = tamano,
                TotalRegistros = filtrados.Count,
                TotalPaginas = (int)Math.Ceiling(filtrados.Count / (double)tamano),
                Datos = filtrados.Skip((pagina - 1) * tamano).Take(tamano).ToList(),
                Opciones = new OpcionesFiltro
                {
                    Carreras = Unicos(todos.Select(e => e.Carrera)),
                    Cursos = Unicos(todos.Select(e => e.Curso)),
                    Grupos = Unicos(todos.Select(e => e.Grupo))
                }
            };
        }

        private async Task<List<EstudianteMatriculado>> ObtenerTodosDelPeriodoAsync(string? periodo, Guid usuarioId, string token)
        {
            if (string.IsNullOrWhiteSpace(periodo) || !Guid.TryParse(periodo, out var periodoId))
                throw new ArgumentException("El periodo es requerido y debe ser un identificador valido");

            if (!await _periodoClient.ExisteAsync(periodoId, usuarioId, token))
                throw new KeyNotFoundException($"No existe un periodo con el identificador '{periodoId}'");

            var grupos = await _grupoClient.ObtenerTodosAsync(usuarioId, token);
            var gruposDelPeriodo = grupos.Where(g => g.PeriodoID == periodoId).ToList();

            var cursos = new Dictionary<string, CursoDto?>();
            var carreras = new Dictionary<string, CarreraDto?>();
            var resultado = new List<EstudianteMatriculado>();

            foreach (var grupo in gruposDelPeriodo)
            {
                var estudiantes = await _matriculaClient.ObtenerPorCursoYGrupoAsync(grupo.CursoCode, grupo.GrupoCode, usuarioId, token);

                if (!cursos.TryGetValue(grupo.CursoCode, out var curso))
                {
                    curso = await _cursoClient.ObtenerPorIdAsync(grupo.CursoCode, usuarioId, token);
                    cursos[grupo.CursoCode] = curso;
                }

                CarreraDto? carrera = null;
                if (curso is not null && !carreras.TryGetValue(curso.CarreraCode, out carrera))
                {
                    carrera = await _carreraClient.ObtenerPorIdAsync(curso.CarreraCode, usuarioId, token);
                    carreras[curso.CarreraCode] = carrera;
                }

                foreach (var est in estudiantes)
                {
                    resultado.Add(new EstudianteMatriculado
                    {
                        Llave = est.Identificacion,
                        TipoIdentificacion = est.TipoIdentificacion,
                        Identificacion = est.Identificacion,
                        NombreCompleto = est.NombreCompleto,
                        Carrera = carrera?.Nombre ?? "N/D",
                        Curso = curso?.Nombre ?? grupo.CursoCode,
                        Grupo = grupo.NumeroGrupo.ToString()
                    });
                }
            }

            return resultado;
        }

        private static bool Coincide(string valor, string? filtro) =>
            string.IsNullOrWhiteSpace(filtro)
            || string.Equals(valor, filtro.Trim(), StringComparison.OrdinalIgnoreCase);

        private static IEnumerable<EstudianteMatriculado> Filtrar(
            IEnumerable<EstudianteMatriculado> lista, string? carrera, string? curso, string? grupo) =>
            lista.Where(e => Coincide(e.Carrera, carrera) && Coincide(e.Curso, curso) && Coincide(e.Grupo, grupo));

        private static IEnumerable<string> Unicos(IEnumerable<string> valores) =>
            valores.Distinct(StringComparer.OrdinalIgnoreCase)
                   .OrderBy(v => v.PadLeft(10, '0'), StringComparer.OrdinalIgnoreCase)
                   .ToList();

        private static IEnumerable<EstudianteMatriculado> Ordenar(
            IEnumerable<EstudianteMatriculado> lista, string? ordenarPor, string? direccion)
        {
            var comparador = StringComparer.OrdinalIgnoreCase;
            var descendente = string.Equals(direccion, "desc", StringComparison.OrdinalIgnoreCase);

            Func<EstudianteMatriculado, string>? clave = null;

            switch ((ordenarPor ?? string.Empty).Trim().ToLowerInvariant())
            {
                case "llave": clave = e => e.Llave; break;
                case "tipo": clave = e => e.TipoIdentificacion; break;
                case "identificacion": clave = e => e.Identificacion; break;
                case "nombre": clave = e => e.NombreCompleto; break;
                case "carrera": clave = e => e.Carrera; break;
                case "curso": clave = e => e.Curso; break;
                case "grupo": clave = e => e.Grupo.PadLeft(10, '0'); break;
            }

            if (clave is null)
            {
                return lista
                    .OrderBy(e => e.Carrera, comparador)
                    .ThenBy(e => e.Curso, comparador)
                    .ThenBy(e => e.Grupo.PadLeft(10, '0'), comparador)
                    .ThenBy(e => e.NombreCompleto, comparador);
            }

            var ordenada = descendente
                ? lista.OrderByDescending(clave, comparador)
                : lista.OrderBy(clave, comparador);

            return ordenada.ThenBy(e => e.NombreCompleto, comparador);
        }
    }
}