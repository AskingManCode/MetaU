using System.Text.Json;
using MicroservicioMatriculas.Entities;
using MicroservicioMatriculas.Repository;

namespace MicroservicioMatriculas.Services
{
    public class MatriculaService : IMatriculaService
    {
        private readonly IMatriculaRepository _repositorio;
        private readonly IBitacoraClient _bitacora;
        private readonly ICursoClient _cursos;
        private readonly IGrupoClient _grupos;
        private readonly IPeriodoClient _periodos;

        public MatriculaService(
            IMatriculaRepository repositorio,
            IBitacoraClient bitacora,
            ICursoClient cursos,
            IGrupoClient grupos,
            IPeriodoClient periodos)
        {
            _repositorio = repositorio;
            _bitacora = bitacora;
            _cursos = cursos;
            _grupos = grupos;
            _periodos = periodos;
        }

        public async Task<MatriculaResponse> Matricular(MatriculaRequest request, ContextoUsuario contexto)
        {
            ValidarRequest(request);

            var estudiante = await _repositorio.BuscarEstudiantePorIdentificacion(request.Identificacion.Trim())
                ?? throw new NoEncontradoException("No existe un estudiante con esa identificación.");

            var (curso, grupo) = await ValidarCursoGrupoPeriodo(request, contexto);

            if (await _repositorio.ContarMatriculadosEnGrupo(grupo.GrupoCode) >= grupo.Cupo)
                throw new ConflictoException("El grupo no tiene cupo disponible.");

            MatriculaXCurso detalle;
            var matricula = await _repositorio.BuscarMatricula(estudiante.EstudianteID, curso.CarreraCode, request.PeriodoID);

            if (matricula is null)
            {
                detalle = new MatriculaXCurso
                {
                    CursoCode = curso.CursoCode,
                    GrupoCode = grupo.GrupoCode,
                    Estado = true,
                    Observaciones = request.Observaciones.Trim()
                };

                matricula = new Matricula
                {
                    EstudianteID = estudiante.EstudianteID,
                    CarreraCode = curso.CarreraCode,
                    PeriodoID = request.PeriodoID,
                    Estado = true
                };
                matricula.Cursos.Add(detalle);

                await _repositorio.InsertarMatricula(matricula);
            }
            else
            {
                var existente = await _repositorio.BuscarCursoEnMatricula(matricula.MatriculaID, curso.CursoCode);

                if (existente is { Estado: true })
                    throw new ConflictoException("El estudiante ya está matriculado en ese curso para el periodo indicado.");

                if (existente is not null)
                {
                    existente.GrupoCode = grupo.GrupoCode;
                    existente.Estado = true;
                    existente.Observaciones = request.Observaciones.Trim();
                    await _repositorio.GuardarCambios();
                    detalle = existente;
                }
                else
                {
                    detalle = new MatriculaXCurso
                    {
                        MatriculaID = matricula.MatriculaID,
                        CursoCode = curso.CursoCode,
                        GrupoCode = grupo.GrupoCode,
                        Estado = true,
                        Observaciones = request.Observaciones.Trim()
                    };
                    await _repositorio.InsertarCurso(detalle);
                }
            }

            var creada = Mapear(detalle, estudiante.Identificacion, request.PeriodoID);

            await _bitacora.Registrar(contexto, JsonSerializer.Serialize(creada));

            return creada;
        }

        public async Task<MatriculaResponse> Modificar(int id, MatriculaRequest request, ContextoUsuario contexto)
        {
            ValidarRequest(request);

            var detalle = await _repositorio.BuscarCursoPorId(id)
                ?? throw new NoEncontradoException("No existe una matrícula con ese identificador.");

            var matricula = detalle.Matricula;
            var identificacion = matricula.Estudiante.Identificacion;

            if (!string.Equals(request.Identificacion.Trim(), identificacion, StringComparison.OrdinalIgnoreCase) ||
                !string.Equals(request.CursoCode.Trim(), detalle.CursoCode, StringComparison.OrdinalIgnoreCase) ||
                request.PeriodoID != matricula.PeriodoID)
            {
                throw new ValidacionException(
                    "Solo se pueden modificar el grupo y las observaciones de la matrícula; la identificación, el curso y el periodo no pueden cambiar.");
            }

            var anterior = Mapear(detalle, identificacion, matricula.PeriodoID);

            var (_, grupo) = await ValidarCursoGrupoPeriodo(request, contexto);

            var cambiaGrupo = !string.Equals(detalle.GrupoCode, grupo.GrupoCode, StringComparison.OrdinalIgnoreCase);
            if (cambiaGrupo && await _repositorio.ContarMatriculadosEnGrupo(grupo.GrupoCode) >= grupo.Cupo)
                throw new ConflictoException("El grupo no tiene cupo disponible.");

            detalle.GrupoCode = grupo.GrupoCode;
            detalle.Observaciones = request.Observaciones.Trim();
            await _repositorio.GuardarCambios();

            var actual = Mapear(detalle, identificacion, matricula.PeriodoID);

            await _bitacora.Registrar(contexto, JsonSerializer.Serialize(new { anterior, actual }));

            return actual;
        }

        public async Task Eliminar(int id, ContextoUsuario contexto)
        {
            var detalle = await _repositorio.BuscarCursoPorId(id)
                ?? throw new NoEncontradoException("No existe una matrícula con ese identificador.");

            var eliminada = Mapear(detalle, detalle.Matricula.Estudiante.Identificacion, detalle.Matricula.PeriodoID);

            detalle.Estado = false;
            await _repositorio.GuardarCambios();

            await _bitacora.Registrar(contexto, JsonSerializer.Serialize(eliminada));
        }

        public async Task<List<EstudianteMatriculadoResponse>> ObtenerEstudiantesMatriculados(
            string cursoCode, string grupoCode, ContextoUsuario contexto)
        {
            if (string.IsNullOrWhiteSpace(cursoCode) || string.IsNullOrWhiteSpace(grupoCode))
                throw new ValidacionException("El curso y el grupo son requeridos y no pueden ser vacíos ni espacios en blanco.");

            var estudiantes = await _repositorio.ListarEstudiantesMatriculados(cursoCode.Trim(), grupoCode.Trim());

            await _bitacora.Registrar(contexto,
                $"El usuario consulta estudiantes matriculados en el curso {cursoCode.Trim()} y grupo {grupoCode.Trim()}");

            return estudiantes
                .Select(e => new EstudianteMatriculadoResponse(
                    e.Identificacion, e.TipoIdentificacionCode, e.NombreCompleto, e.Email))
                .ToList();
        }

        public async Task<List<MatriculaResponse>> ObtenerMatriculasPorEstudiante(string identificacion, ContextoUsuario contexto)
        {
            if (string.IsNullOrWhiteSpace(identificacion))
                throw new ValidacionException("La identificacion es requerida.");

            var matriculas = await _repositorio.ListarCursosPorEstudiante(identificacion.Trim());

            await _bitacora.Registrar(contexto, $"El usuario consulta las matriculas del estudiante {identificacion.Trim()}");

            return matriculas
                .Select(x => Mapear(x, x.Matricula.Estudiante.Identificacion, x.Matricula.PeriodoID))
                .ToList();
        }

        private static void ValidarRequest(MatriculaRequest request)
        {
            var faltantes = new List<string>();

            if (string.IsNullOrWhiteSpace(request.Identificacion)) faltantes.Add("identificacion");
            if (string.IsNullOrWhiteSpace(request.CursoCode)) faltantes.Add("cursoCode");
            if (string.IsNullOrWhiteSpace(request.GrupoCode)) faltantes.Add("grupoCode");
            if (string.IsNullOrWhiteSpace(request.Observaciones)) faltantes.Add("observaciones");
            if (request.PeriodoID == Guid.Empty) faltantes.Add("periodoID");

            if (faltantes.Count > 0)
                throw new ValidacionException(
                    $"Todos los datos son requeridos y no pueden ser vacíos ni espacios en blanco. Faltan: {string.Join(", ", faltantes)}.");
        }

        private async Task<(CursoInfo curso, GrupoInfo grupo)> ValidarCursoGrupoPeriodo(
            MatriculaRequest request, ContextoUsuario contexto)
        {
            var curso = await _cursos.ObtenerPorCodigo(request.CursoCode.Trim(), contexto)
                ?? throw new NoEncontradoException("No existe el curso indicado.");

            var grupo = await _grupos.ObtenerPorCodigo(request.GrupoCode.Trim(), contexto)
                ?? throw new NoEncontradoException("No existe el grupo indicado.");

            if (!string.Equals(grupo.CursoCode, curso.CursoCode, StringComparison.OrdinalIgnoreCase))
                throw new ValidacionException("El grupo no pertenece al curso indicado.");

            var periodo = await _periodos.ObtenerPorId(request.PeriodoID, contexto)
                ?? throw new NoEncontradoException("No existe el periodo indicado.");

            var hoy = DateTime.Today;
            if (hoy < periodo.FechaInicio.Date || hoy > periodo.FechaFin.Date)
                throw new ValidacionException("El periodo indicado no está activo.");

            return (curso, grupo);
        }

        private static MatriculaResponse Mapear(MatriculaXCurso detalle, string identificacion, Guid periodoId) =>
            new(detalle.MatriculaXCursoID, detalle.MatriculaID, identificacion, detalle.CursoCode, detalle.GrupoCode, periodoId, detalle.Observaciones);
    }
}