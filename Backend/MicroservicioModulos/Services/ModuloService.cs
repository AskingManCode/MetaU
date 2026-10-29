using MicroservicioModulos.Entities;
using MicroservicioModulos.Repository;
using MicroservicioModulos.Services.Clients;
using MicroservicioRoles.Services.Clients;
using System.Text.RegularExpressions;

namespace MicroservicioModulos.Services
{
    public class ModuloService : IModuloService
    {
        private static readonly Regex IdRegex = new(@"^[A-Z]{1,15}$");
        private static readonly Regex NombreRegex = new(@"^[a-zA-ZáéíóúÁÉÍÓÚñÑ\s]+$");

        private const string Items_Pagina = "PAGSIZE";
        private const int TamanoPaginaDefecto = 15;

        private readonly ModuloRepository _moduloRepository;
        private readonly IParametroServiceClient _parametroServiceClient;

        public ModuloService(ModuloRepository moduloRepository, IParametroServiceClient parametroServiceClient)
        {
            _moduloRepository = moduloRepository;
            _parametroServiceClient = parametroServiceClient;
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

            if (modulo.Orden is < 0)
                throw new ArgumentException("El orden del modulo no puede ser negativo");

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

            if (modulo.Orden is < 0)
                throw new ArgumentException("El orden del modulo no puede ser negativo");

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

            if (await _moduloRepository.TieneRolAsignadosAsync(id))
                throw new InvalidOperationException(
                    "No se puede eliminar este modulo porque tiene asignado a uno o mas roles");

            var filas = await _moduloRepository.EliminarAsync(id);
            if (filas <= 0)
                throw new ApplicationException("No se pudo eliminar el modulo");

            return existente;
        }

        public async Task<PaginaResultado<Modulos>> ObtenerPaginadoAsync(int pagina, Guid usuarioId, string token)
        {
            if (pagina < 1)
                throw new ArgumentException("La pagina debe ser mayor o igual a 1");

            int tamano;
            try
            {
                var valor = await _parametroServiceClient.ObtenerValorAsync(Items_Pagina, usuarioId, token);
                tamano = int.TryParse(valor, out var n) && n > 0 ? n : TamanoPaginaDefecto;
            }
            catch (HttpRequestException)
            {
                tamano = TamanoPaginaDefecto;
            }

            var todos = (await _moduloRepository.ObtenerTodosAsync()).ToList();

            return new PaginaResultado<Modulos>
            {
                Pagina = pagina,
                TamanoPagina = tamano,
                TotalRegistros = todos.Count,
                TotalPaginas = (int)Math.Ceiling(todos.Count / (double)tamano),
                Datos = todos.Skip((pagina - 1) * tamano).Take(tamano).ToList()
            };
        }
    }
}