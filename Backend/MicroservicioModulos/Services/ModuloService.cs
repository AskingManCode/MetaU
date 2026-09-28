using Microsoft.AspNetCore.Identity;
using System.Reflection;

namespace MicroservicioModulos.Services
{
    public class ModuloService : IModuloService
    {
        private readonly ModuloService _moduloService;

        public ModuloService(ModuloService moduloService)
        {
            _moduloService = moduloService;
        }

        public async Task<IEnumerable<Module>> ObtenerTodosAsync()
        {
            return await _moduloService.ObtenerTodosAsync();
        }

        public async Task<Module?> ObtenerPorIdAsync(string id)
        {
            return await _moduloService.ObtenerPorIdAsync(id);
        }

        public async Task<int> CrearAsync(Module module)
        {
            return await _moduloService.CrearAsync(module);
        }

        public async Task<int> ActualizarAsync(Module module)
        {
            return await _moduloService.ActualizarAsync(module);
        }

        public async Task<int> EliminarAsync(string id)
        {
            return await _moduloService.EliminarAsync(id);
        }
    }
}
