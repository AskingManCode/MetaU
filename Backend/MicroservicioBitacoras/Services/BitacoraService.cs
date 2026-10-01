using MicroservicioBitacoras.Entities;
using MicroservicioBitacoras.Repository;

namespace MicroservicioBitacoras.Services
{
    public class BitacoraService : IBitacoraService
    {
        private readonly IBitacoraRepository _repository;

        public BitacoraService(IBitacoraRepository repository)
        {
            _repository = repository;
        }

        public async Task RegistrarAsync(BitacoraRequest request)
        {
            if (request.Usuario <= 0)
                throw new ArgumentException("El usuario es requerido");

            if (string.IsNullOrWhiteSpace(request.Descripcion))
                throw new ArgumentException("La descripcion es requerida");

            await _repository.RegistrarAsync(request.Usuario, request.Descripcion);
        }

        public Task<IEnumerable<Bitacora>> ObtenerTodosAsync()
        {
            return _repository.ObtenerTodosAsync();
        }
    }
}