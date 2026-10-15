using System.Text.RegularExpressions;
using MicroservicioModulos.Entities;
using MicroservicioModulos.Repository;

namespace MicroservicioModulos.Services
{
    public class ModuloService : IModuloService
    {
        private static readonly Regex IdRegex = new(@"^[A-Z]{1,15}$");
        private static readonly Regex NombreRegex = new(@"^[a-zA-ZáéíóúÁÉÍÓÚñÑ\s]+$");

        private readonly ModuloRepository _moduloRepository;

        public ModuloService(ModuloRepository moduloRepository)
        {
            _moduloRepository = moduloRepository;
        }

        public async Task<IEnumerable<Modulos>> ObtenerTodosAsync()
        {
            return await _moduloRepository.ObtenerTodosAsync();
        }

        public async Task<Modulos> ObtenerPorIdAsync(string id)
        {
            var modulo = await _moduloRepository.ObtenerPorIdAsync(id);
            if (modulo is null)
                throw new KeyNotFoundException($"No existe un modulo con ID '{id}'");

            return modulo;
        }

        public async Task<Modulos> CrearAsync(Modulos modulo)
        {
            if (modulo is null || string.IsNullOrWhiteSpace(modulo.IdModulo) || string.IsNullOrWhiteSpace(modulo.Nombre))
                throw new ArgumentException("El ID y el nombre del modulo son obligatorios y no pueden estar vacíos");

            if (!IdRegex.IsMatch(modulo.IdModulo))
                throw new ArgumentException("El ID del modulo solo puede tener letras mayusculas");

            if (!NombreRegex.IsMatch(modulo.Nombre))
                throw new ArgumentException("El nombre del modulo solo puede tener letras y espacios");

            var existente = await _moduloRepository.ObtenerPorIdAsync(modulo.IdModulo);
            if (existente is not null)
                throw new InvalidOperationException($"Ya existe un modulo con el ID '{modulo.IdModulo}'");

            var filas = await _moduloRepository.CrearAsync(modulo);
            if (filas <= 0)
                throw new ApplicationException("No se pudo crear el modulo");

            return modulo;
        }

        public async Task<(Modulos Anterior, Modulos Actual)> ActualizarAsync(string id, Modulos modulo)
        {
            if (modulo is null)
                throw new ArgumentException("Los datos del modulo son obligatorios");

            if (!string.Equals(id, modulo.IdModulo, StringComparison.OrdinalIgnoreCase))
                throw new ArgumentException("El ID de la ruta y el del cuerpo no coinciden");

            if (string.IsNullOrWhiteSpace(modulo.Nombre))
                throw new ArgumentException("El nombre del modulo es obligatorio");

            if (!NombreRegex.IsMatch(modulo.Nombre))
                throw new ArgumentException("El nombre del modulo solo puede tener letras y espacios");

            var anterior = await ObtenerPorIdAsync(id);

            var filas = await _moduloRepository.ActualizarAsync(modulo);
            if (filas <= 0)
                throw new ApplicationException("No se pudo actualizar el modulo");

            var actual = await _moduloRepository.ObtenerPorIdAsync(id) ?? modulo;

            return (anterior, actual);
        }

        public async Task<Modulos> EliminarAsync(string id)
        {
            var existente = await ObtenerPorIdAsync(id);

            var filas = await _moduloRepository.EliminarAsync(id);
            if (filas <= 0)
                throw new ApplicationException("No se pudo eliminar el modulo");

            return existente;
        }
    }
}