using MicroservicioCarreras.Entities;
using MicroservicioCarreras.Repository;

namespace MicroservicioCarreras.Services
{
    public class CarreraService : ICarreraService
    {
        private readonly ICarreraRepository _repository;

        public CarreraService(ICarreraRepository repository)
        {
            _repository = repository;
        }

        public Task<Carrera?> ObtenerPorIdAsync(string carreraCode) =>
            _repository.ObtenerPorIdAsync(carreraCode);

        public Task<IEnumerable<Carrera>> ObtenerTodosAsync() =>
            _repository.ObtenerTodosAsync();

        public Task<IEnumerable<Carrera>> ObtenerPorInstitucionAsync(string institucionCode) =>
            _repository.ObtenerPorInstitucionAsync(institucionCode);

        public async Task CrearAsync(Carrera carrera)
        {
            ValidarCamposBasicos(carrera.CarreraCode, carrera.InstitucionCode, carrera.DirectorID, carrera.Nombre);

            if (await _repository.ExisteAsync(carrera.CarreraCode))
                throw new ConflictoException($"Ya existe una carrera con el identificador {carrera.CarreraCode}");

            carrera.Estado = true;
            await _repository.CrearAsync(carrera);
        }

        public async Task<bool> ActualizarAsync(string carreraCode, string nombre, Guid directorId)
        {
            if (string.IsNullOrWhiteSpace(carreraCode))
                throw new ArgumentException("El identificador de la carrera es requerido");

            if (string.IsNullOrWhiteSpace(nombre))
                throw new ArgumentException("El nombre de la carrera es requerido");

            if (!SoloLetrasYEspacios(nombre))
                throw new ArgumentException("El nombre de la carrera solo puede tener letras y espacios");

            if (directorId == Guid.Empty)
                throw new ArgumentException("El director de la carrera es requerido");

            return await _repository.ActualizarAsync(carreraCode, nombre, directorId);
        }

        public Task<bool> EliminarAsync(string carreraCode) =>
            _repository.EliminarAsync(carreraCode);

        private static void ValidarCamposBasicos(string carreraCode, string institucionCode, Guid directorId, string nombre)
        {
            if (string.IsNullOrWhiteSpace(carreraCode))
                throw new ArgumentException("El identificador de la carrera es requerido");

            if (string.IsNullOrWhiteSpace(institucionCode))
                throw new ArgumentException("La institucion de la carrera es requerida");

            if (directorId == Guid.Empty)
                throw new ArgumentException("El director de la carrera es requerido");

            if (string.IsNullOrWhiteSpace(nombre))
                throw new ArgumentException("El nombre de la carrera es requerido");

            if (!SoloLetrasYEspacios(nombre))
                throw new ArgumentException("El nombre de la carrera solo puede tener letras y espacios");
        }

        private static bool SoloLetrasYEspacios(string texto) =>
            texto.All(c => char.IsLetter(c) || c == ' ');
    }
}
