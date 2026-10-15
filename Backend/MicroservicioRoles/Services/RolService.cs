using System.Text.RegularExpressions;
using MicroservicioRoles.Entities;
using MicroservicioRoles.Repository;

namespace MicroservicioRoles.Services
{
    public class RolService : IRolService
    {
        private static readonly Regex IdRegex = new(@"^[A-Z]{1,15}$");
        private static readonly Regex NombreRegex = new(@"^[a-zA-ZáéíóúÁÉÍÓÚñÑ\s]+$");

        private readonly RolRepository _rolRepository;

        public RolService(RolRepository rolRepository)
        {
            _rolRepository = rolRepository;
        }

        public async Task<IEnumerable<Rol>> ObtenerTodosAsync()
        {
            return await _rolRepository.ObtenerTodosAsync();
        }

        public async Task<Rol> ObtenerPorIdAsync(string id)
        {
            var rol = await _rolRepository.ObtenerPorIdAsync(id);
            if (rol is null)
                throw new KeyNotFoundException($"No existe un rol con ID '{id}'");

            return rol;
        }

        public async Task<Rol> CrearAsync(Rol rol)
        {
            if (rol is null || string.IsNullOrWhiteSpace(rol.IdRol) || string.IsNullOrWhiteSpace(rol.Nombre))
                throw new ArgumentException("El ID y el nombre del rol son obligatorios y no pueden estar vacíos");

            if (!IdRegex.IsMatch(rol.IdRol))
                throw new ArgumentException("El ID del rol solo puede tener letras mayusculas");

            if (!NombreRegex.IsMatch(rol.Nombre))
                throw new ArgumentException("El nombre del rol solo puede tener letras y espacios");

            var existente = await _rolRepository.ObtenerPorIdAsync(rol.IdRol);
            if (existente is not null)
                throw new InvalidOperationException($"Ya existe un rol con el ID '{rol.IdRol}'");

            var filas = await _rolRepository.CrearAsync(rol);
            if (filas <= 0)
                throw new ApplicationException("No se pudo crear el rol");

            return rol;
        }

        public async Task<(Rol Anterior, Rol Actual)> ActualizarAsync(string id, Rol rol)
        {
            if (rol is null)
                throw new ArgumentException("Los datos del rol son obligatorios");

            if (!string.Equals(id, rol.IdRol, StringComparison.OrdinalIgnoreCase))
                throw new ArgumentException("El ID de la ruta y el del cuerpo no coinciden");

            if (string.IsNullOrWhiteSpace(rol.Nombre))
                throw new ArgumentException("El nombre del rol es obligatorio");

            if (!NombreRegex.IsMatch(rol.Nombre))
                throw new ArgumentException("El nombre del rol solo puede tener letras y espacios");

            var anterior = await ObtenerPorIdAsync(id);

            var filas = await _rolRepository.ActualizarAsync(rol);
            if (filas <= 0)
                throw new ApplicationException("No se pudo actualizar el rol");

            var actual = await _rolRepository.ObtenerPorIdAsync(id) ?? rol;

            return (anterior, actual);
        }

        public async Task<Rol> EliminarAsync(string id)
        {
            var existente = await ObtenerPorIdAsync(id);

            var filas = await _rolRepository.EliminarAsync(id);
            if (filas <= 0)
                throw new ApplicationException("No se pudo eliminar el rol");

            return existente;
        }
    }
}