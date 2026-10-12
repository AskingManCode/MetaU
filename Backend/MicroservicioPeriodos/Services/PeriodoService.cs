using MicroservicioPeriodos.Entities;
using MicroservicioPeriodos.Repository;

namespace MicroservicioPeriodos.Services
{
    public class PeriodoService : IPeriodoService
    {
        private readonly IPeriodoRepository _repository;

        public PeriodoService(IPeriodoRepository repository)
        {
            _repository = repository;
        }

        public async Task<Periodo> CrearAsync(Periodo periodo)
        {
            ValidarPeriodo(periodo);
            return await _repository.CrearAsync(periodo);
        }

        public async Task<Periodo> ModificarAsync(Periodo periodo)
        {
            var anterior = await ObtenerPorIdAsync(periodo.PeriodoID);
            periodo.Estado = anterior.Estado;

            ValidarPeriodo(periodo);
            await _repository.ModificarAsync(periodo);

            return anterior;
        }

        public async Task<Periodo> EliminarAsync(Guid periodoID)
        {
            var periodo = await ObtenerPorIdAsync(periodoID);
            await _repository.EliminarAsync(periodoID);
            return periodo;
        }

        public Task<IEnumerable<Periodo>> ObtenerTodosAsync()
        {
            return _repository.ObtenerTodosAsync();
        }

        public async Task<Periodo> ObtenerPorIdAsync(Guid periodoID)
        {
            var periodo = await _repository.ObtenerPorIdAsync(periodoID);

            if (periodo == null)
                throw new KeyNotFoundException("El periodo no existe");

            return periodo;
        }

        private static void ValidarPeriodo(Periodo periodo)
        {
            if (periodo.Anio == 0)
                throw new ArgumentException("El anio es requerido");

            if (periodo.NumeroPeriodo == 0)
                throw new ArgumentException("El numero de periodo es requerido");

            if (periodo.FechaInicio == default)
                throw new ArgumentException("La fecha de inicio es requerida");

            if (periodo.FechaFin == default)
                throw new ArgumentException("La fecha de fin es requerida");

            if (periodo.FechaFin <= periodo.FechaInicio)
                throw new ArgumentException("La fecha de fin debe ser posterior a la fecha de inicio");
        }
    }
}