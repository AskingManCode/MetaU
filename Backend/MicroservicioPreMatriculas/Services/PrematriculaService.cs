using System.Text.Json;
using System.Text.RegularExpressions;
using MicroservicioPreMatriculas.Entities;
using MicroservicioPreMatriculas.Repository;

namespace MicroservicioPreMatriculas.Services
{
    public class PrematriculaService : IPrematriculaService
    {
        private readonly IPrematriculaRepository _repositorio;
        private readonly IBitacoraClient _bitacora;
        private readonly ICursoClient _cursos;
        private readonly IPeriodoClient _periodos;

        public PrematriculaService(
            IPrematriculaRepository repositorio,
            IBitacoraClient bitacora,
            ICursoClient cursos,
            IPeriodoClient periodos)
        {
            _repositorio = repositorio;
            _bitacora = bitacora;
            _cursos = cursos;
            _periodos = periodos;
        }

        public async Task<PrematriculaResponse> Prematricular(PrematriculaRequest request, ContextoUsuario contexto)
        {
            ValidarRequest(request);

            var estudiante = await _repositorio.BuscarEstudiantePorIdentificacion(request.Identificacion.Trim())
                ?? throw new NoEncontradoException("No existe un estudiante con esa identificación.");

            var cursos = await ValidarPeriodoYCursos(request, contexto);
            var carreraCode = request.CarreraCode.Trim();
            var observaciones = NormalizarObservaciones(request.Observaciones);

            var existente = await _repositorio.BuscarPorEstudianteCarreraPeriodo(
                estudiante.EstudianteID, carreraCode, request.PeriodoID);

            Prematricula prematricula;

            if (existente is null)
            {
                prematricula = new Prematricula
                {
                    Estudiante = estudiante,
                    EstudianteID = estudiante.EstudianteID,
                    CarreraCode = carreraCode,
                    PeriodoID = request.PeriodoID,
                    Observaciones = observaciones,
                    Estado = true
                };
                AplicarCursos(prematricula, cursos);

                await _repositorio.Insertar(prematricula);
            }
            else
            {
                if (existente.Estado)
                    throw new ConflictoException("El estudiante ya tiene una prematrícula para esa carrera y periodo.");

                existente.Estado = true;
                existente.Observaciones = observaciones;
                AplicarCursos(existente, cursos);
                await _repositorio.GuardarCambios();

                prematricula = existente;
            }

            var creada = Mapear(prematricula);

            await _bitacora.Registrar(contexto, JsonSerializer.Serialize(creada));

            return creada;
        }

        public async Task<PrematriculaResponse> Modificar(Guid id, PrematriculaRequest request, ContextoUsuario contexto)
        {
            ValidarRequest(request);

            var prematricula = await _repositorio.BuscarPorId(id)
                ?? throw new NoEncontradoException("No existe una prematrícula con ese identificador.");

            var anterior = Mapear(prematricula);

            var estudiante = await _repositorio.BuscarEstudiantePorIdentificacion(request.Identificacion.Trim())
                ?? throw new NoEncontradoException("No existe un estudiante con esa identificación.");

            var cursos = await ValidarPeriodoYCursos(request, contexto);
            var carreraCode = request.CarreraCode.Trim();

            var otra = await _repositorio.BuscarPorEstudianteCarreraPeriodo(
                estudiante.EstudianteID, carreraCode, request.PeriodoID);
            if (otra is not null && otra.PreMatriculaID != prematricula.PreMatriculaID)
                throw new ConflictoException("Ya existe una prematrícula para ese estudiante, carrera y periodo.");

            prematricula.Estudiante = estudiante;
            prematricula.EstudianteID = estudiante.EstudianteID;
            prematricula.CarreraCode = carreraCode;
            prematricula.PeriodoID = request.PeriodoID;
            prematricula.Observaciones = NormalizarObservaciones(request.Observaciones);
            AplicarCursos(prematricula, cursos);

            await _repositorio.GuardarCambios();

            var actual = Mapear(prematricula);

            await _bitacora.Registrar(contexto, JsonSerializer.Serialize(new { anterior, actual }));

            return actual;
        }

        public async Task Eliminar(Guid id, ContextoUsuario contexto)
        {
            var prematricula = await _repositorio.BuscarPorId(id)
                ?? throw new NoEncontradoException("No existe una prematrícula con ese identificador.");

            var eliminada = Mapear(prematricula);

            prematricula.Estado = false;
            foreach (var curso in prematricula.Cursos)
                curso.Estado = false;

            await _repositorio.GuardarCambios();

            await _bitacora.Registrar(contexto, JsonSerializer.Serialize(eliminada));
        }

        public async Task<List<PrematriculaResponse>> ObtenerTodas(ContextoUsuario contexto)
        {
            var prematriculas = await _repositorio.ListarActivas();

            await _bitacora.Registrar(contexto, "El usuario consulta las prematrículas");

            return prematriculas.Select(Mapear).ToList();
        }

        public async Task<PrematriculaResponse> ObtenerPorId(Guid id, ContextoUsuario contexto)
        {
            var prematricula = await _repositorio.BuscarPorId(id)
                ?? throw new NoEncontradoException("No existe una prematrícula con ese identificador.");

            await _bitacora.Registrar(contexto, $"El usuario consulta la prematrícula {id}");

            return Mapear(prematricula);
        }

        private static void ValidarRequest(PrematriculaRequest request)
        {
            var faltantes = new List<string>();

            if (string.IsNullOrWhiteSpace(request.Identificacion)) faltantes.Add("identificacion");
            if (string.IsNullOrWhiteSpace(request.CarreraCode)) faltantes.Add("carreraCode");
            if (request.Cursos is null || request.Cursos.Count == 0 || request.Cursos.Any(string.IsNullOrWhiteSpace))
                faltantes.Add("cursos");
            if (request.PeriodoID == Guid.Empty) faltantes.Add("periodoID");

            if (faltantes.Count > 0)
                throw new ValidacionException(
                    $"Los datos son requeridos y no pueden ser vacíos ni espacios en blanco. Faltan: {string.Join(", ", faltantes)}.");
        }

        private async Task<List<string>> ValidarPeriodoYCursos(PrematriculaRequest request, ContextoUsuario contexto)
        {
            var periodo = await _periodos.ObtenerPorId(request.PeriodoID, contexto)
                ?? throw new NoEncontradoException("No existe el periodo indicado.");

            if (periodo.FechaInicio.Date <= DateTime.Today)
                throw new ValidacionException("Solo se pueden prematricular periodos futuros.");

            var codigos = new List<string>();

            foreach (var codigo in request.Cursos
                         .Select(c => c.Trim())
                         .Distinct(StringComparer.OrdinalIgnoreCase))
            {
                var curso = await _cursos.ObtenerPorCodigo(codigo, contexto)
                    ?? throw new NoEncontradoException($"No existe el curso {codigo}.");

                if (curso.Nivel != 1)
                    throw new ValidacionException($"El curso {curso.CursoCode} no es de primer nivel.");

                codigos.Add(curso.CursoCode);
            }

            return codigos;
        }

        private static void AplicarCursos(Prematricula prematricula, List<string> codigos)
        {
            foreach (var curso in prematricula.Cursos)
                curso.Estado = codigos.Contains(curso.CursoCode, StringComparer.OrdinalIgnoreCase);

            foreach (var codigo in codigos)
            {
                if (!prematricula.Cursos.Any(c => string.Equals(c.CursoCode, codigo, StringComparison.OrdinalIgnoreCase)))
                    prematricula.Cursos.Add(new PrematriculaCurso { CursoCode = codigo, Estado = true });
            }
        }

        private static string? NormalizarObservaciones(string? observaciones) =>
            string.IsNullOrWhiteSpace(observaciones)
                ? null
                : Regex.Replace(observaciones.Trim(), " {2,}", " ");

        private static PrematriculaResponse Mapear(Prematricula p) =>
            new(p.PreMatriculaID,
                p.Estudiante.Identificacion,
                p.CarreraCode,
                p.Cursos.Where(c => c.Estado).Select(c => c.CursoCode).ToList(),
                p.Observaciones,
                p.PeriodoID);
    }
}
