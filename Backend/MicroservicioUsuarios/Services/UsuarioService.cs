using System.Text.RegularExpressions;
using MicroservicioUsuarios.Entities;
using MicroservicioUsuarios.Repository;
using MicroservicioUsuarios.Services.Clients;
using MicroservicioUsuarios.Services.Helpers;

namespace MicroservicioUsuarios.Services
{
    public class UsuarioService : IUsuarioService
    {
        private readonly IUsuarioRepository _repository;
        private readonly IPasswordHasher _passwordHasher;
        private readonly IParametroServiceClient _parametroServiceClient;
        private readonly IRolServiceClient _rolServiceClient;

        private const string Dominio_Estudiante = "DOMEST";
        private const string Dominio_Profes = "DOMPROF";

        public UsuarioService(
            IUsuarioRepository repository,
            IPasswordHasher passwordHasher,
            IParametroServiceClient parametroServiceClient,
            IRolServiceClient rolServiceClient)
        {
            _repository = repository;
            _passwordHasher = passwordHasher;
            _parametroServiceClient = parametroServiceClient;
            _rolServiceClient = rolServiceClient;
        }

        public Task<IEnumerable<Usuario>> ListarAsync() => _repository.ListarAsync();

        public Task<IEnumerable<Usuario>> FiltrarAsync(string? identificacion, string? nombre, string? tipo, string? dominio = null, string? rol = null)
    => _repository.FiltrarAsync(identificacion, nombre, tipo, dominio?.Trim().TrimStart('@'), rol);

        public Task<IEnumerable<Usuario>> ConsultarAsync(string? identificacion, string? nombre, string? tipo, string? dominio = null, string? rol = null)
        {
            var hayFiltro = identificacion is not null || nombre is not null || tipo is not null
                            || dominio is not null || rol is not null;

            return hayFiltro
                ? FiltrarAsync(identificacion, nombre, tipo, dominio, rol)
                : ListarAsync();
        }

        public Task<Usuario?> ObtenerAsync(string email) => _repository.ObtenerPorEmailAsync(email);

        public async Task<(bool exito, string? error)> ValidarAsync(UsuarioRequest dto, bool esActualizacion, Guid usuarioId, string token)
        {
            if (dto is null
                || string.IsNullOrWhiteSpace(dto.Email) || string.IsNullOrWhiteSpace(dto.Nombre)
                || string.IsNullOrWhiteSpace(dto.Identificacion) || string.IsNullOrWhiteSpace(dto.TipoIdentificacion)
                || string.IsNullOrWhiteSpace(dto.IdRol) || (!esActualizacion && string.IsNullOrWhiteSpace(dto.Contrasena)))
            {
                return (false, "Todos los campos son obligatorios y no pueden estar vacíos");
            }

            if (!Regex.IsMatch(dto.Nombre, @"^[a-zA-ZáéíóúÁÉÍÓÚñÑ\s]+$"))
                return (false, "El nombre solo puede tener letras y espacios");

            if (!Regex.IsMatch(dto.Email, @"^[^@\s]+@[^@\s]+\.[^@\s]+$"))
                return (false, "El formato del email no es valido");

            var dominioEmail = dto.Email.Split('@').Last().ToLowerInvariant();

            var dominioEstudiante = await _parametroServiceClient.ObtenerValorAsync(Dominio_Estudiante, usuarioId, token);
            var dominioDocente = await _parametroServiceClient.ObtenerValorAsync(Dominio_Profes, usuarioId, token);

            if (string.IsNullOrWhiteSpace(dominioEstudiante) || string.IsNullOrWhiteSpace(dominioDocente))
                return (false, "No se pudieron obtener los dominios configurados");

            dominioEstudiante = dominioEstudiante.ToLowerInvariant();
            dominioDocente = dominioDocente.ToLowerInvariant();

            if (dominioEmail != dominioEstudiante && dominioEmail != dominioDocente)
                return (false, $"El email debe pertenecer al dominio {dominioEstudiante} o {dominioDocente}");

            var rol = await _rolServiceClient.ObtenerPorIdAsync(dto.IdRol, usuarioId, token);
            if (rol is null)
                return (false, $"El rol '{dto.IdRol}' no existe");

            var nombreRol = rol.Nombre.Trim().ToLowerInvariant();

            if (dominioEmail == dominioEstudiante && nombreRol != "estudiante")
                return (false, $"Los emails del dominio {dominioEstudiante} deben tener rol Estudiante");

            if (dominioEmail == dominioDocente && nombreRol != "profesor" && nombreRol != "administrador")
                return (false, $"Los emails del dominio {dominioDocente} deben tener rol Profesor o Administrador");

            return (true, null);
        }

        public async Task<Usuario> CrearAsync(UsuarioRequest dto, Guid usuarioId, string token)
        {
            var (valido, error) = await ValidarAsync(dto, false, usuarioId, token);
            if (!valido)
                throw new ArgumentException(error);

            var existente = await _repository.ObtenerPorEmailAsync(dto.Email);
            if (existente is not null)
                throw new InvalidOperationException($"Ya existe un usuario con email '{dto.Email}'");

            var mismaIdentificacion = await _repository.FiltrarAsync(dto.Identificacion, null, null);
            if (mismaIdentificacion.Any())
                throw new InvalidOperationException($"Ya existe un usuario con la identificación '{dto.Identificacion}'");

            var usuario = new Usuario
            {
                UsuarioId = Guid.NewGuid(),
                Email = dto.Email,
                TipoIdentificacionCode = dto.TipoIdentificacion,
                Identificacion = dto.Identificacion,
                NombreCompleto = dto.Nombre,
                RolCode = dto.IdRol,
                ContrasenaHash = _passwordHasher.Encriptar(dto.Contrasena!),
                Estado = true
            };

            var filas = await _repository.CrearAsync(usuario);
            if (filas <= 0)
                throw new ApplicationException("No se pudo crear el usuario");

            return await _repository.ObtenerPorEmailAsync(dto.Email) ?? usuario;
        }

        public async Task<(Usuario Anterior, Usuario Actual)> ActualizarAsync(string email, UsuarioRequest dto, Guid usuarioId, string token)
        {
            var (valido, error) = await ValidarAsync(dto, true, usuarioId, token);
            if (!valido)
                throw new ArgumentException(error);

            var anterior = await _repository.ObtenerPorEmailAsync(email);
            if (anterior is null)
                throw new KeyNotFoundException($"No existe un usuario con email '{email}'");

            var nuevo = new Usuario
            {
                UsuarioId = anterior.UsuarioId,
                Email = anterior.Email,
                Estado = anterior.Estado,
                ContrasenaHash = anterior.ContrasenaHash,
                TipoIdentificacionCode = dto.TipoIdentificacion,
                Identificacion = dto.Identificacion,
                NombreCompleto = dto.Nombre,
                RolCode = dto.IdRol
            };

            if (!string.IsNullOrWhiteSpace(dto.Contrasena))
                nuevo.ContrasenaHash = _passwordHasher.Encriptar(dto.Contrasena);

            var filas = await _repository.ActualizarAsync(nuevo);
            if (filas <= 0)
                throw new ApplicationException("No se pudo actualizar el usuario");

            var actual = await _repository.ObtenerPorEmailAsync(email) ?? nuevo;

            return (anterior, actual);
        }

        public async Task<Usuario> EliminarAsync(string email)
        {
            var existente = await _repository.ObtenerPorEmailAsync(email);
            if (existente is null)
                throw new KeyNotFoundException($"No existe un usuario con email '{email}'");

            var filas = await _repository.EliminarAsync(email);
            if (filas <= 0)
                throw new ApplicationException("No se pudo eliminar el usuario");

            return existente;
        }
    }
}