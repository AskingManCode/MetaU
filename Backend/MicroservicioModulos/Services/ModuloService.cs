using MicroservicioModulos.Entities;
using MicroservicioModulos.Repository;
using Microsoft.AspNetCore.Identity;
using System.Reflection;

namespace MicroservicioModulos.Services
{
    public class ModuloService : IModuloService
    {
        private readonly ModuloRepository _moduloRepository;

        public ModuloService(ModuloRepository moduloRepository)
        {
            _moduloRepository = moduloRepository;
        }

        public async Task<IEnumerable<Modulos>> ObtenerTodosAsync()
        {
            return await _moduloRepository.ObtenerTodosAsync();
        }

        public async Task<Modulos?> ObtenerPorIdAsync(string id)
        {
            return await _moduloRepository.ObtenerPorIdAsync(id);
        }

        public async Task<int> CrearAsync(Modulos modulos)
        {
            return await _moduloRepository.CrearAsync(modulos);
        }

        public async Task<int> ActualizarAsync(Modulos modulos)
        {
            return await _moduloRepository.ActualizarAsync(modulos);
        }

        public async Task<int> EliminarAsync(string id)
        {
            return await _moduloRepository.EliminarAsync(id);
        }
    }
}
