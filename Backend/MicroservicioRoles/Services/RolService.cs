using System.Text.RegularExpressions;
using MicroservicioRoles.Entities;
using MicroservicioRoles.Repository;
using MicroservicioRoles.Services.Clients;

namespace MicroservicioRoles.Services
{
    public class RolService : IRolService
    {
        private static readonly Regex IdRegex = new(@"^[A-Z]{1,15}$");
        private static readonly Regex NombreRegex = new(@"^[a-zA-ZáéíóúÁÉÍÓÚñÑ\s]+$");

        private const string Items_Pagina = "PAGSIZE";
        private const int TamanoPaginaDefecto = 15;

        private readonly RolRepository _rolRepository;
        private readonly IParametroServiceClient _parametroServiceClient;

        public RolService(RolRepository rolRepository, IParametroServiceClient parametroServiceClient)
        {
            _rolRepository = rolRepository;
            _parametroServiceClient = parametroServiceClient;
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

            if (await _rolRepository.ExisteNombreAsync(rol.Nombre))
                throw new InvalidOperationException($"Ya existe un rol con el nombre '{rol.Nombre}'");

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

            if (await _rolRepository.ExisteNombreAsync(rol.Nombre))
                throw new InvalidOperationException($"Ya existe un rol con el nombre '{rol.Nombre}'");

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

        public async Task<IEnumerable<RolModulo>> ObtenerPermisosAsync(string id)
        {
            await ObtenerPorIdAsync(id);
            return await _rolRepository.ObtenerPermisosAsync(id);
        }

        public async Task<(IEnumerable<RolModulo> Anteriores, IEnumerable<RolModulo> Actuales)> ActualizarPermisosAsync(string id, List<RolModulo> cambios)
        {
            if (cambios is null || cambios.Count == 0)
                throw new ArgumentException("Debe indicar al menos un modulo");

            if (cambios.GroupBy(c => c.IdModulo).Any(g => g.Count() > 1))
                throw new ArgumentException("Hay modulos repetidos en la solicitud");

            var permisos = (await ObtenerPermisosAsync(id)).ToList();
            var anteriores = new List<RolModulo>();
            var actuales = new List<RolModulo>();

            foreach (var cambio in cambios)
            {
                var anterior = permisos.FirstOrDefault(p => p.IdModulo == cambio.IdModulo)
                    ?? throw new KeyNotFoundException($"No existe un modulo con ID '{cambio.IdModulo}'");

                anteriores.Add(anterior);
                actuales.Add(new RolModulo { IdModulo = anterior.IdModulo, Nombre = anterior.Nombre, Estado = cambio.Estado });
            }

            await _rolRepository.ActualizarPermisosAsync(id, actuales);
            return (anteriores, actuales);
        }

        public async Task<PaginaResultado<Rol>> ObtenerPaginadoAsync(int pagina, Guid usuarioId, string token)
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

            var todos = (await _rolRepository.ObtenerTodosAsync()).ToList();

            return new PaginaResultado<Rol>
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