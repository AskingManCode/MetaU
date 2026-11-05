using System.Text.Json;
using MicroservicioCarreras.Entities;
using MicroservicioCarreras.Repository;

namespace MicroservicioCarreras.Services
{
    public class CarreraService : ICarreraService
    {
        private readonly ICarreraRepository _repository;
        private readonly IAuthServiceClient _authService;
        private readonly IBitacoraServiceClient _bitacoraService;
        private readonly IParametroServiceClient _parametroServiceClient;

        private const string Items_Pagina = "PAGSIZE";
        private const int TamanoPaginaDefecto = 15;

        public CarreraService(
            ICarreraRepository repository,
            IAuthServiceClient authService,
            IBitacoraServiceClient bitacoraService,
            IParametroServiceClient parametroServiceClient)
        {
            _repository = repository;
            _authService = authService;
            _bitacoraService = bitacoraService;
            _parametroServiceClient = parametroServiceClient;
        }

        public Task<Carrera> CrearAsync(Carrera carrera, string? authorization, string? usuarioId) =>
            EjecutarAutorizadaAsync(
                authorization,
                usuarioId,
                "crear carrera",
                async () =>
                {
                    await CrearInternoAsync(carrera);
                    return carrera;
                },
                actual => JsonSerializer.Serialize(actual));

        public async Task<Carrera> ActualizarAsync(
            string carreraCode,
            CarreraUpdateRequest request,
            string? authorization,
            string? usuarioId)
        {
            var resultado = await EjecutarAutorizadaAsync(
                authorization,
                usuarioId,
                "modificar carrera",
                async () =>
                {
                    var anterior = await _repository.ObtenerPorIdAsync(carreraCode);
                    if (anterior is null)
                        throw new KeyNotFoundException($"No existe una carrera activa con el identificador {carreraCode}");

                    var actualizada = await ActualizarInternoAsync(carreraCode, request.Nombre, request.DirectorID);
                    if (!actualizada)
                        throw new KeyNotFoundException($"No existe una carrera activa con el identificador {carreraCode}");

                    var actual = new Carrera
                    {
                        CarreraCode = carreraCode,
                        InstitucionCode = anterior.InstitucionCode,
                        DirectorID = request.DirectorID,
                        Nombre = request.Nombre,
                        Estado = true
                    };

                    return (Anterior: anterior, Actual: actual);
                },
                resultado => JsonSerializer.Serialize(new { anterior = resultado.Anterior, actual = resultado.Actual }));

            return resultado.Actual;
        }

        public async Task EliminarAsync(string carreraCode, string? authorization, string? usuarioId)
        {
            await EjecutarAutorizadaAsync(
                authorization,
                usuarioId,
                "eliminar carrera",
                async () =>
                {
                    var carrera = await _repository.ObtenerPorIdAsync(carreraCode);
                    if (carrera is null)
                        throw new KeyNotFoundException($"No existe una carrera activa con el identificador {carreraCode}");

                    await _repository.EliminarAsync(carreraCode);
                    return carrera;
                },
                carrera => JsonSerializer.Serialize(carrera));
        }

        public Task<IEnumerable<Carrera>> ObtenerTodosAsync(string? authorization, string? usuarioId) =>
            EjecutarAutorizadaAsync(
                authorization,
                usuarioId,
                "obtener carreras",
                () => _repository.ObtenerTodosAsync(),
                _ => "El usuario consulta carreras");

        public Task<PaginaResultado<Carrera>> ObtenerPaginadoAsync(int pagina, string? authorization, string? usuarioId) =>
            EjecutarAutorizadaAsync(
                authorization,
                usuarioId,
                "obtener carreras paginadas",
                async () =>
                {
                    if (pagina < 1)
                        throw new ArgumentException("La pagina debe ser mayor o igual a 1");

                    var tamano = await ObtenerTamanoPaginaAsync(Guid.Parse(usuarioId!), ObtenerToken(authorization));
                    var todas = (await _repository.ObtenerTodosAsync()).ToList();
                    return Paginar(todas, pagina, tamano);
                },
                _ => "El usuario consulta carreras");

        public Task<Carrera> ObtenerPorIdAsync(string carreraCode, string? authorization, string? usuarioId) =>
            EjecutarAutorizadaAsync(
                authorization,
                usuarioId,
                "obtener carrera por id",
                async () => await _repository.ObtenerPorIdAsync(carreraCode)
                    ?? throw new KeyNotFoundException($"No existe una carrera activa con el identificador {carreraCode}"),
                _ => $"El usuario consulta carrera {carreraCode}");

        public Task<IEnumerable<Carrera>> ObtenerPorInstitucionAsync(
            string institucionCode,
            string? authorization,
            string? usuarioId) =>
            EjecutarAutorizadaAsync(
                authorization,
                usuarioId,
                "obtener carreras por institucion",
                () => _repository.ObtenerPorInstitucionAsync(institucionCode),
                _ => $"El usuario consulta carreras de la institucion {institucionCode}");

        public Task<PaginaResultado<Carrera>> ObtenerPorInstitucionPaginadoAsync(string institucionCode, int pagina, string? authorization, string? usuarioId) =>
            EjecutarAutorizadaAsync(
                authorization,
                usuarioId,
                "obtener carreras por institucion paginadas",
                async () =>
                {
                    if (pagina < 1)
                        throw new ArgumentException("La pagina debe ser mayor o igual a 1");

                    var tamano = await ObtenerTamanoPaginaAsync(Guid.Parse(usuarioId!), ObtenerToken(authorization));
                    var todas = (await _repository.ObtenerPorInstitucionAsync(institucionCode)).ToList();
                    return Paginar(todas, pagina, tamano);
                },
                _ => $"El usuario consulta carreras de la institucion {institucionCode}");

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

        private async Task CrearInternoAsync(Carrera carrera)
        {
            ValidarCamposBasicos(carrera.CarreraCode, carrera.InstitucionCode, carrera.DirectorID, carrera.Nombre);

            if (await _repository.ExisteAsync(carrera.CarreraCode))
                throw new ConflictoException($"Ya existe una carrera con el identificador {carrera.CarreraCode}");

            carrera.Estado = true;
            await _repository.CrearAsync(carrera);
        }

        private async Task<bool> ActualizarInternoAsync(string carreraCode, string nombre, Guid directorId)
        {
            if (string.IsNullOrWhiteSpace(carreraCode))
                throw new ArgumentException("El identificador de la carrera es requerido");

            if (string.IsNullOrWhiteSpace(nombre))
                throw new ArgumentException("El nombre de la carrera es requerido");

            if (!SoloLetrasYEspacios(nombre))
                throw new ArgumentException("El nombre de la carrera solo puede tener letras y espacios");

            if (directorId == Guid.Empty)
                throw new ArgumentException("El director de la carrera es requerido");

            return await _repository.ActualizarAsync(carreraCode, nombre, directorId);
        }

        private async Task<T> EjecutarAutorizadaAsync<T>(
            string? authorization,
            string? usuarioIdHeader,
            string operacion,
            Func<Task<T>> accion,
            Func<T, string> descripcion)
        {
            Acceso? acceso = null;

            try
            {
                acceso = await ValidarAccesoAsync(authorization, usuarioIdHeader);
                var resultado = await accion();
                await RegistrarBitacoraAsync(acceso.UsuarioId, descripcion(resultado), acceso.Token);
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
                    await RegistrarErrorAsync(acceso.UsuarioId, acceso.Token, operacion, ex);

                throw;
            }
        }

        private async Task<Acceso> ValidarAccesoAsync(string? authorization, string? usuarioIdHeader)
        {
            var token = ObtenerToken(authorization);
            if (string.IsNullOrWhiteSpace(token) || !await _authService.ValidarTokenAsync(token))
                throw new UnauthorizedAccessException();

            if (!Guid.TryParse(usuarioIdHeader, out var usuarioId))
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

        private async Task RegistrarBitacoraAsync(Guid usuarioId, string descripcion, string token)
        {
            try
            {
                await _bitacoraService.RegistrarAsync(usuarioId, descripcion, token);
            }
            catch
            {
            }
        }

        private Task RegistrarErrorAsync(Guid usuarioId, string token, string operacion, Exception ex) =>
            RegistrarBitacoraAsync(usuarioId, $"Error tecnico en {operacion}: {ex.Message}", token);

        private static void ValidarCamposBasicos(string carreraCode, string institucionCode, Guid directorId, string nombre)
        {
            if (string.IsNullOrWhiteSpace(carreraCode))
                throw new ArgumentException("El identificador de la carrera es requerido");

            if (string.IsNullOrWhiteSpace(institucionCode))
                throw new ArgumentException("La institucion de la carrera es requerida");

            if (directorId == Guid.Empty)
                throw new ArgumentException("El director de la carrera es requerido");

            if (string.IsNullOrWhiteSpace(nombre))
                throw new ArgumentException("El nombre de la carrera es requerido");

            if (!SoloLetrasYEspacios(nombre))
                throw new ArgumentException("El nombre de la carrera solo puede tener letras y espacios");
        }

        private static bool SoloLetrasYEspacios(string texto) =>
            texto.All(c => char.IsLetter(c) || c == ' ');

        private sealed record Acceso(Guid UsuarioId, string Token);
    }
}
