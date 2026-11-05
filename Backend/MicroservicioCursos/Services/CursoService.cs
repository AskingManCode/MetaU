using System.Text.Json;
using System.Text.RegularExpressions;
using MicroservicioCursos.Entities;
using MicroservicioCursos.Repository;

namespace MicroservicioCursos.Services
{
    public class CursoService : ICursoService
    {
        private readonly ICursoRepository _repository;
        private readonly IAuthServiceClient _authService;
        private readonly IBitacoraServiceClient _bitacoraService;
        private readonly IParametroServiceClient _parametroServiceClient;

        private const string Items_Pagina = "PAGSIZE";
        private const int TamanoPaginaDefecto = 15;

        public CursoService(
            ICursoRepository repository,
            IAuthServiceClient authService,
            IBitacoraServiceClient bitacoraService,
            IParametroServiceClient parametroServiceClient)
        {
            _repository = repository;
            _authService = authService;
            _bitacoraService = bitacoraService;
            _parametroServiceClient = parametroServiceClient;
        }

        public Task<Curso> CrearAsync(CursoRequest request, string? authorization, string? usuarioId) =>
            EjecutarAutorizadaAsync(
                authorization,
                usuarioId,
                registrarErrorEnArgumento: false,
                async () =>
                {
                    if (await _repository.ObtenerPorIdAsync(request.CursoCode) is not null)
                        throw new ConflictoException("El curso ya existe");

                    var curso = CrearCurso(request);
                    await CrearInternoAsync(curso);
                    return curso;
                },
                curso => JsonSerializer.Serialize(curso));

        public async Task<Curso> ModificarAsync(
            string cursoCode,
            CursoRequest request,
            string? authorization,
            string? usuarioId)
        {
            var resultado = await EjecutarAutorizadaAsync(
                authorization,
                usuarioId,
                registrarErrorEnArgumento: false,
                async () =>
                {
                    if (!cursoCode.Equals(request.CursoCode, StringComparison.OrdinalIgnoreCase))
                        throw new ArgumentException("El identificador del curso no coincide con la ruta");

                    var anterior = await _repository.ObtenerPorIdAsync(cursoCode);
                    if (anterior is null)
                        throw new KeyNotFoundException("El curso no existe");

                    var curso = CrearCurso(request);
                    curso.Estado = anterior.Estado;
                    await ModificarInternoAsync(curso);

                    return (Anterior: anterior, Actual: curso);
                },
                resultado => $"Anterior: {JsonSerializer.Serialize(resultado.Anterior)} Actual: {JsonSerializer.Serialize(resultado.Actual)}");

            return resultado.Actual;
        }

        public Task<Curso> EliminarAsync(string cursoCode, string? authorization, string? usuarioId) =>
            EjecutarAutorizadaAsync(
                authorization,
                usuarioId,
                registrarErrorEnArgumento: true,
                async () =>
                {
                    var curso = await _repository.ObtenerPorIdAsync(cursoCode);
                    if (curso is null)
                        throw new KeyNotFoundException("El curso no existe");

                    await _repository.EliminarAsync(cursoCode);
                    return curso;
                },
                curso => JsonSerializer.Serialize(curso));

        public Task<IEnumerable<Curso>> ObtenerTodosAsync(string? authorization, string? usuarioId) =>
            EjecutarAutorizadaAsync(
                authorization,
                usuarioId,
                registrarErrorEnArgumento: true,
                () => _repository.ObtenerTodosAsync(),
                _ => "El usuario consulta cursos");

        public Task<Curso> ObtenerPorIdAsync(string cursoCode, string? authorization, string? usuarioId) =>
            EjecutarAutorizadaAsync(
                authorization,
                usuarioId,
                registrarErrorEnArgumento: true,
                async () => await _repository.ObtenerPorIdAsync(cursoCode)
                    ?? throw new KeyNotFoundException("El curso no existe"),
                _ => "El usuario consulta curso");

        public Task<IEnumerable<Curso>> ObtenerPorCarreraAsync(
            string carreraCode,
            string? authorization,
            string? usuarioId) =>
            EjecutarAutorizadaAsync(
                authorization,
                usuarioId,
                registrarErrorEnArgumento: false,
                async () =>
                {
                    if (string.IsNullOrWhiteSpace(carreraCode))
                        throw new ArgumentException("La carrera es requerida");

                    return await _repository.ObtenerPorCarreraAsync(carreraCode);
                },
                _ => "El usuario consulta cursos por carrera");

        public Task<PaginaResultado<Curso>> ObtenerPaginadoAsync(int pagina, string? authorization, string? usuarioId) =>
            EjecutarAutorizadaAsync(
                authorization,
                usuarioId,
                registrarErrorEnArgumento: false,
                async () =>
                {
                    if (pagina < 1)
                        throw new ArgumentException("La pagina debe ser mayor o igual a 1");

                    var tamano = await ObtenerTamanoPaginaAsync(Guid.Parse(usuarioId!), ObtenerToken(authorization));
                    var todos = (await _repository.ObtenerTodosAsync()).ToList();
                    return Paginar(todos, pagina, tamano);
                },
                _ => "El usuario consulta cursos");

        public Task<PaginaResultado<Curso>> ObtenerPorCarreraPaginadoAsync(string carreraCode, int pagina, string? authorization, string? usuarioId) =>
            EjecutarAutorizadaAsync(
                authorization,
                usuarioId,
                registrarErrorEnArgumento: false,
                async () =>
                {
                    if (string.IsNullOrWhiteSpace(carreraCode))
                        throw new ArgumentException("La carrera es requerida");

                    if (pagina < 1)
                        throw new ArgumentException("La pagina debe ser mayor o igual a 1");

                    var tamano = await ObtenerTamanoPaginaAsync(Guid.Parse(usuarioId!), ObtenerToken(authorization));
                    var todos = (await _repository.ObtenerPorCarreraAsync(carreraCode)).ToList();
                    return Paginar(todos, pagina, tamano);
                },
                _ => "El usuario consulta cursos por carrera");

        private async Task<int> ObtenerTamanoPaginaAsync(Guid usuarioId, string token)
        {
            try
            {
                var valor = await _parametroServiceClient.ObtenerValorAsync(Items_Pagina, usuarioId, token);
                return int.TryParse(valor, out var n) && n > 0 ? n : TamanoPaginaDefecto;
            }
            catch (Exception ex) when (ex is HttpRequestException or TaskCanceledException)
            {
                return TamanoPaginaDefecto;
            }
        }

        private static PaginaResultado<T> Paginar<T>(List<T> todos, int pagina, int tamano) => new()
        {
            Pagina = pagina,
            TamanoPagina = tamano,
            TotalRegistros = todos.Count,
            TotalPaginas = (int)Math.Ceiling(todos.Count / (double)tamano),
            Datos = todos.Skip((pagina - 1) * tamano).Take(tamano).ToList()
        };

        private async Task CrearInternoAsync(Curso curso)
        {
            ValidarCurso(curso);
            await _repository.CrearAsync(curso);
        }

        private async Task ModificarInternoAsync(Curso curso)
        {
            ValidarCurso(curso);
            await _repository.ModificarAsync(curso);
        }

        private async Task<T> EjecutarAutorizadaAsync<T>(
            string? authorization,
            string? usuarioIdHeader,
            bool registrarErrorEnArgumento,
            Func<Task<T>> accion,
            Func<T, string> descripcion)
        {
            Acceso? acceso = null;

            try
            {
                acceso = await ValidarAccesoAsync(authorization, usuarioIdHeader);
                var resultado = await accion();
                await _bitacoraService.RegistrarAsync(acceso.UsuarioId, descripcion(resultado), acceso.Token);
                return resultado;
            }
            catch (UnauthorizedAccessException)
            {
                throw;
            }
            catch (UsuarioRequeridoException)
            {
                throw;
            }
            catch (ArgumentException)
            {
                if (registrarErrorEnArgumento && acceso is not null)
                    await RegistrarErrorAsync(acceso.UsuarioId, acceso.Token);

                throw;
            }
            catch (ConflictoException)
            {
                throw;
            }
            catch (KeyNotFoundException)
            {
                throw;
            }
            catch (Exception ex)
            {
                if (acceso is not null)
                    await RegistrarErrorAsync(acceso.UsuarioId, acceso.Token);

                throw;
            }
        }

        private async Task<Acceso> ValidarAccesoAsync(string? authorization, string? usuarioIdHeader)
        {
            var token = ObtenerToken(authorization);
            if (string.IsNullOrWhiteSpace(token) || !await _authService.ValidarTokenAsync(token))
                throw new UnauthorizedAccessException();

            if (!Guid.TryParse(usuarioIdHeader, out var usuarioId) || usuarioId == Guid.Empty)
                throw new UsuarioRequeridoException();

            return new Acceso(usuarioId, token);
        }

        private static string ObtenerToken(string? authorization)
        {
            if (string.IsNullOrWhiteSpace(authorization) ||
                !authorization.StartsWith("Bearer ", StringComparison.OrdinalIgnoreCase))
            {
                return string.Empty;
            }

            return authorization["Bearer ".Length..].Trim();
        }

        private async Task RegistrarErrorAsync(Guid usuarioId, string token)
        {
            try
            {
                await _bitacoraService.RegistrarAsync(
                    usuarioId,
                    "Error tecnico en administracion de cursos",
                    token);
            }
            catch
            {
            }
        }

        private static Curso CrearCurso(CursoRequest request) => new()
        {
            CursoCode = request.CursoCode,
            CarreraCode = request.CarreraCode,
            Nombre = request.Nombre,
            Nivel = request.Nivel,
            Estado = true
        };

        private static void ValidarCurso(Curso curso)
        {
            if (curso is null)
                throw new ArgumentException("Los datos del curso son requeridos");

            if (string.IsNullOrWhiteSpace(curso.CursoCode))
                throw new ArgumentException("El identificador del curso es requerido");

            if (string.IsNullOrWhiteSpace(curso.CarreraCode))
                throw new ArgumentException("La carrera es requerida");

            if (string.IsNullOrWhiteSpace(curso.Nombre))
                throw new ArgumentException("El nombre del curso es requerido");

            if (!Regex.IsMatch(curso.Nombre.Trim(), @"^[\p{L} ]+$"))
                throw new ArgumentException("El nombre del curso solo puede contener letras y espacios");

            if (curso.Nivel < 1 || curso.Nivel > 12)
                throw new ArgumentException("El nivel debe estar entre 1 y 12");
        }

        private sealed record Acceso(Guid UsuarioId, string Token);
    }
}
