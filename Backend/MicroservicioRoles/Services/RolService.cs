using MicroservicioRoles.Entities;
using MicroservicioRoles.Repository;

namespace MicroservicioRoles.Services
{
    public class RolService : IRolService
    {
        private readonly RolRepository _rolRepository;

        public RolService(RolRepository rolRepository)
        {
            _rolRepository = rolRepository;
        }

        public async Task<IEnumerable<Rol>> ObtenerTodosAsync()
        {
            return await _rolRepository.ObtenerTodosAsync();
        }

        public async Task<Rol?> ObtenerPorIdAsync(string id)
        {
            return await _rolRepository.ObtenerPorIdAsync(id);
        }

        public async Task<int> CrearAsync(Rol rol)
        {
            return await _rolRepository.CrearAsync(rol);
        }

        public async Task<int> ActualizarAsync(Rol rol)
        {
            return await _rolRepository.ActualizarAsync(rol);
        }

        public async Task<int> EliminarAsync(string id)
        {
            return await _rolRepository.EliminarAsync(id);
        }


        public bool ValidarDatos(Rol rol)
        {
            return !string.IsNullOrWhiteSpace(rol.IdRol) && !string.IsNullOrWhiteSpace(rol.Nombre);
        }

        public bool ValidarNombre(string nombre)
        {
            return System.Text.RegularExpressions.Regex.IsMatch(nombre, @"^[a-zA-ZáéíóúÁÉÍÓÚñÑ\s]+$");
        }
    }
   
}
