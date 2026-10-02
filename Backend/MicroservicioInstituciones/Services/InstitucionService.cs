using MicroservicioInstituciones.Entities;
using MicroservicioInstituciones.Repository;

namespace MicroservicioInstituciones.Services
{
    public class InstitucionService : IInstitucionService
    {
        private readonly IInstitucionRepository _repository;

        public InstitucionService(IInstitucionRepository repository)
        {
            _repository = repository;
        }

        public Task<Institucion?> ObtenerPorIdAsync(string institucionCode) =>
            _repository.ObtenerPorIdAsync(institucionCode);

        public Task<IEnumerable<Institucion>> ObtenerTodosAsync() =>
            _repository.ObtenerTodosAsync();

        public async Task CrearAsync(Institucion institucion)
        {
            if (string.IsNullOrWhiteSpace(institucion.InstitucionCode))
                throw new ArgumentException("El identificador de la institucion es requerido");

            if (string.IsNullOrWhiteSpace(institucion.Nombre))
                throw new ArgumentException("El nombre de la institucion es requerido");

            if (!SoloLetrasYEspacios(institucion.Nombre))
                throw new ArgumentException("El nombre de la institucion solo puede tener letras y espacios");

            if (await _repository.ExisteAsync(institucion.InstitucionCode))
                throw new ConflictoException($"Ya existe una institucion con el identificador {institucion.InstitucionCode}");

            institucion.Estado = true;
            await _repository.CrearAsync(institucion);
        }

        public async Task<bool> ActualizarAsync(string institucionCode, string nombre)
        {
            if (string.IsNullOrWhiteSpace(institucionCode))
                throw new ArgumentException("El identificador de la institucion es requerido");

            if (string.IsNullOrWhiteSpace(nombre))
                throw new ArgumentException("El nombre de la institucion es requerido");

            if (!SoloLetrasYEspacios(nombre))
                throw new ArgumentException("El nombre de la institucion solo puede tener letras y espacios");

            return await _repository.ActualizarAsync(institucionCode, nombre);
        }

        public Task<bool> EliminarAsync(string institucionCode) =>
            _repository.EliminarAsync(institucionCode);

        private static bool SoloLetrasYEspacios(string texto) =>
            texto.All(c => char.IsLetter(c) || c == ' ');
    }
}
