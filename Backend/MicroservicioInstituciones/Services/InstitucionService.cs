using System.Text.Json;
using MicroservicioInstituciones.Entities;
using MicroservicioInstituciones.Repository;

namespace MicroservicioInstituciones.Services
{
    public class InstitucionService : IInstitucionService
    {
        private readonly IInstitucionRepository _repository;
        private readonly IAuthServiceClient _authService;
        private readonly IBitacoraServiceClient _bitacoraService;

        public InstitucionService(
            IInstitucionRepository repository,
            IAuthServiceClient authService,
            IBitacoraServiceClient bitacoraService)
        {
            _repository = repository;
            _authService = authService;
            _bitacoraService = bitacoraService;
        }

        public Task<Institucion> CrearAsync(Institucion institucion, string? authorization, string? usuarioId) =>
            EjecutarAutorizadaAsync(
                authorization,
                usuarioId,
                "crear institucion",
                async () =>
                {
                    await CrearInternoAsync(institucion);
                    return institucion;
                },
                actual => JsonSerializer.Serialize(actual));

        public async Task<Institucion> ActualizarAsync(
            string institucionCode,
            InstitucionUpdateRequest request,
            string? authorization,
            string? usuarioId)
        {
            var resultado = await EjecutarAutorizadaAsync(
                authorization,
                usuarioId,
                "modificar institucion",
                async () =>
                {
                    var anterior = await _repository.ObtenerPorIdAsync(institucionCode);
                    if (anterior is null)
                        throw new KeyNotFoundException($"No existe una institucion activa con el identificador {institucionCode}");

                    var actualizado = await ActualizarInternoAsync(institucionCode, request.Nombre);
                    if (!actualizado)
                        throw new KeyNotFoundException($"No existe una institucion activa con el identificador {institucionCode}");

                    var actual = new Institucion
                    {
                        InstitucionCode = institucionCode,
                        Nombre = request.Nombre,
                        Estado = true
                    };

                    return (Anterior: anterior, Actual: actual);
                },
                resultado => JsonSerializer.Serialize(new { anterior = resultado.Anterior, actual = resultado.Actual }));

            return resultado.Actual;
        }

        public async Task EliminarAsync(string institucionCode, string? authorization, string? usuarioId)
        {
            await EjecutarAutorizadaAsync(
                authorization,
                usuarioId,
                "eliminar institucion",
                async () =>
                {
                    var institucion = await _repository.ObtenerPorIdAsync(institucionCode);
                    if (institucion is null)
                        throw new KeyNotFoundException($"No existe una institucion activa con el identificador {institucionCode}");

                    await _repository.EliminarAsync(institucionCode);
                    return institucion;
                },
                institucion => JsonSerializer.Serialize(institucion));
        }

        public Task<IEnumerable<Institucion>> ObtenerTodosAsync(string? authorization, string? usuarioId) =>
            EjecutarAutorizadaAsync(
                authorization,
                usuarioId,
                "obtener instituciones",
                () => _repository.ObtenerTodosAsync(),
                _ => "El usuario consulta instituciones");

        public Task<Institucion> ObtenerPorIdAsync(string institucionCode, string? authorization, string? usuarioId) =>
            EjecutarAutorizadaAsync(
                authorization,
                usuarioId,
                "obtener institucion por id",
                async () => await _repository.ObtenerPorIdAsync(institucionCode)
                    ?? throw new KeyNotFoundException($"No existe una institucion activa con el identificador {institucionCode}"),
                _ => $"El usuario consulta institucion {institucionCode}");

        private async Task CrearInternoAsync(Institucion institucion)
        {
            if (string.IsNullOrWhiteSpace(institucion.InstitucionCode))
                throw new ArgumentException("El identificador de la institucion es requerido");

            if (string.IsNullOrWhiteSpace(institucion.Nombre))
                throw new ArgumentException("El nombre de la institucion es requerido");

            if (!SoloLetrasYEspacios(institucion.Nombre))
                throw new ArgumentException("El nombre de la institucion solo puede tener letras y espacios");

            if (await _repository.ExisteAsync(institucion.InstitucionCode))
                throw new ConflictoException($"Ya existe una institucion con el identificador {institucion.InstitucionCode}");

            institucion.Estado = true;
            await _repository.CrearAsync(institucion);
        }

        private async Task<bool> ActualizarInternoAsync(string institucionCode, string nombre)
        {
            if (string.IsNullOrWhiteSpace(institucionCode))
                throw new ArgumentException("El identificador de la institucion es requerido");

            if (string.IsNullOrWhiteSpace(nombre))
                throw new ArgumentException("El nombre de la institucion es requerido");

            if (!SoloLetrasYEspacios(nombre))
                throw new ArgumentException("El nombre de la institucion solo puede tener letras y espacios");

            return await _repository.ActualizarAsync(institucionCode, nombre);
        }

        private async Task<T> EjecutarAutorizadaAsync<T>(
            string? authorization,
            string? usuarioIdHeader,
            string operacion,
            Func<Task<T>> accion,
            Func<T, string> descripcion)
        {
            Guid? usuarioId = null;

            try
            {
                usuarioId = await ValidarAccesoAsync(authorization, usuarioIdHeader);
                var resultado = await accion();
                await RegistrarBitacoraAsync(usuarioId.Value, descripcion(resultado));
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
                if (usuarioId.HasValue)
                    await RegistrarErrorAsync(usuarioId.Value, operacion, ex);

                throw;
            }
        }

        private async Task<Guid> ValidarAccesoAsync(string? authorization, string? usuarioIdHeader)
        {
            var token = ObtenerToken(authorization);
            if (string.IsNullOrWhiteSpace(token) || !await _authService.ValidarTokenAsync(token))
                throw new UnauthorizedAccessException();

            if (!Guid.TryParse(usuarioIdHeader, out var usuarioId))
                throw new UsuarioRequeridoException();

            return usuarioId;
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

        private async Task RegistrarBitacoraAsync(Guid usuarioId, string descripcion)
        {
            try
            {
                await _bitacoraService.RegistrarAsync(usuarioId, descripcion);
            }
            catch
            {
            }
        }

        private Task RegistrarErrorAsync(Guid usuarioId, string operacion, Exception ex) =>
            RegistrarBitacoraAsync(usuarioId, $"Error tecnico en {operacion}: {ex.Message}");

        private static bool SoloLetrasYEspacios(string texto) =>
            texto.All(c => char.IsLetter(c) || c == ' ');
    }
}
