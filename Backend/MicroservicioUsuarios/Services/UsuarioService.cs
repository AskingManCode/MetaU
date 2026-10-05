using System.Text.RegularExpressions;
using MicroservicioUsuarios.Entities;
using MicroservicioUsuarios.Repository;

namespace MicroservicioUsuarios.Services
{
    public class UsuarioService : IUsuarioService
    {
        private readonly IUsuarioRepository _repository;
        private readonly IPasswordHasher _passwordHasher;
        private readonly IParametroServiceClient _parametroServiceClient;
        private readonly IRolServiceClient _rolServiceClient;

        private const string Dominio_Estudiante = "DOMESTUD";
        private const string Dominio_Profes = "DOMDOCENT";

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

        public Task<IEnumerable<Usuario>> FiltrarAsync(string? identificacion, string? nombre, string? tipo)
            => _repository.FiltrarAsync(identificacion, nombre, tipo);

        public Task<Usuario?> ObtenerAsync(string email) => _repository.ObtenerPorEmailAsync(email);

        public async Task<(bool exito, string? error)> ValidarAsync(UsuarioRequest dto, bool esActualizacion, Guid usuarioId, string token)
        {
            if (string.IsNullOrWhiteSpace(dto.Email) || string.IsNullOrWhiteSpace(dto.Nombre)
                || string.IsNullOrWhiteSpace(dto.Identificacion) || string.IsNullOrWhiteSpace(dto.TipoIdentificacion)
                || string.IsNullOrWhiteSpace(dto.IdRol) || (!esActualizacion && string.IsNullOrWhiteSpace(dto.Contrasena)))
            {
                return (false, "Todos los campos son obligatorios y no pueden estar vacíos");
            }

            if (!Regex.IsMatch(dto.Nombre, @"^[a-zA-ZáéíóúÁÉÍÓÚñÑ\s]+$"))
                return (false, "El nombre solo puede tener letras y espacios");

            if (!Regex.IsMatch(dto.Email, @"^[^@\s]+@[^@\s]+\.[^@\s]+$"))
                return (false, "El formato del email no es válido");

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

        public async Task<int> CrearAsync(UsuarioRequest dto)
        {
            var usuario = new Usuario
            {
                UsuarioId = Guid.NewGuid(),
                Email = dto.Email,
                TipoIndentificacionCode = dto.TipoIdentificacion,
                Identificacion = dto.Identificacion,
                NombreCompleto = dto.Nombre,
                RolCode = dto.IdRol,
                ContrasenaHash = _passwordHasher.Encriptar(dto.Contrasena!),
                Estado = true
            };

            return await _repository.CrearAsync(usuario);
        }

        public async Task<int> ActualizarAsync(string email, UsuarioRequest dto)
        {
            var existente = await _repository.ObtenerPorEmailAsync(email);
            if (existente is null) return 0;

            existente.TipoIndentificacionCode = dto.TipoIdentificacion;
            existente.Identificacion = dto.Identificacion;
            existente.NombreCompleto = dto.Nombre;
            existente.RolCode = dto.IdRol;

            if (!string.IsNullOrWhiteSpace(dto.Contrasena))
                existente.ContrasenaHash = _passwordHasher.Encriptar(dto.Contrasena);

            return await _repository.ActualizarAsync(existente);
        }

        public Task<int> EliminarAsync(string email) => _repository.EliminarAsync(email);
    }
}