using System.Text.RegularExpressions;
using MicroservicioUsuarios.Entities;
using MicroservicioUsuarios.Repository;

namespace MicroservicioUsuarios.Services
{
    public class UsuarioService : IUsuarioService
    {
        private readonly IUsuarioRepository _repository;
        private readonly IPasswordHasher _passwordHasher;
        private const string ROL_ESTUDIANTE = "EST";
        private const string ROL_PROFESOR = "PROF";
        private const string ROL_ADMIN = "ADMIN";

        public UsuarioService(IUsuarioRepository repository, IPasswordHasher passwordHasher)
        {
            _repository = repository;
            _passwordHasher = passwordHasher;
        }

        public Task<IEnumerable<Usuario>> ListarAsync() => _repository.ListarAsync();

        public Task<IEnumerable<Usuario>> FiltrarAsync(string? identificacion, string? nombre, string? tipo)
            => _repository.FiltrarAsync(identificacion, nombre, tipo);

        public Task<Usuario?> ObtenerAsync(string email) => _repository.ObtenerPorEmailAsync(email);

        public Task<(bool exito, string? error)> ValidarAsync(UsuarioRequest dto, bool esActualizacion)
        {
            if (string.IsNullOrWhiteSpace(dto.Email) || string.IsNullOrWhiteSpace(dto.Nombre)
                || string.IsNullOrWhiteSpace(dto.Identificacion) || string.IsNullOrWhiteSpace(dto.TipoIdentificacion)
                || string.IsNullOrWhiteSpace(dto.IdRol) || (!esActualizacion && string.IsNullOrWhiteSpace(dto.Contrasena)))
            {
                return Task.FromResult((false, (string?)"Todos los campos son obligatorios y no pueden estar vacios"));
            }

            if (!Regex.IsMatch(dto.Nombre, @"^[a-zA-ZáéíóúÁÉÍÓÚñÑ\s]+$"))
                return Task.FromResult((false, (string?)"El nombre solo puede tener letras y espacios"));

            if (!Regex.IsMatch(dto.Email, @"^[^@\s]+@[^@\s]+\.[^@\s]+$"))
                return Task.FromResult((false, (string?)"El formato del email no es valido"));

            var dominio = dto.Email.Split('@').Last().ToLowerInvariant();

            if (dominio != "cuc.cr" && dominio != "cuc.ac.cr")
                return Task.FromResult((false, (string?)"El email debe pertenecer al dominio cuc.cr o cuc.ac.cr."));

            if (dominio == "cuc.cr" && dto.IdRol != ROL_ESTUDIANTE)
                return Task.FromResult((false, (string?)"Los emails del dominio cuc.cr deben tener rol Estudiante"));

            if (dominio == "cuc.ac.cr" && dto.IdRol != ROL_PROFESOR && dto.IdRol != ROL_ADMIN)
                return Task.FromResult((false, (string?)"Los emails del dominio cuc.ac.cr deben tener rol Profesor o Administrador"));

            return Task.FromResult((true, (string?)null));
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
                ContrasenaHash = _passwordHasher.Encriptar(dto.Contrasena),
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