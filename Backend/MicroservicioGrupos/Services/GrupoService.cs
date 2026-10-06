using MicroservicioGrupos.Entities;
using MicroservicioGrupos.Repository;

namespace MicroservicioGrupos.Services
{
    public class GrupoService : IGrupoService
    {
        private readonly IGrupoRepository _repository;

        public GrupoService(IGrupoRepository repository)
        {
            _repository = repository;
        }

        public async Task CrearAsync(Grupo grupo)
        {
            ValidarGrupo(grupo);
            await _repository.CrearAsync(grupo);
        }

        public async Task ModificarAsync(Grupo grupo)
        {
            ValidarGrupo(grupo);
            await _repository.ModificarAsync(grupo);
        }

        public Task EliminarAsync(string grupoCode)
        {
            return _repository.EliminarAsync(grupoCode);
        }

        public Task<IEnumerable<Grupo>> ObtenerTodosAsync()
        {
            return _repository.ObtenerTodosAsync();
        }

        public Task<Grupo?> ObtenerPorIdAsync(string grupoCode)
        {
            return _repository.ObtenerPorIdAsync(grupoCode);
        }

        private static void ValidarGrupo(Grupo grupo)
        {
            if (string.IsNullOrWhiteSpace(grupo.GrupoCode))
                throw new ArgumentException("El identificador del grupo es requerido");

            if (grupo.NumeroGrupo == 0)
                throw new ArgumentException("El numero del grupo es requerido");

            if (string.IsNullOrWhiteSpace(grupo.CursoCode))
                throw new ArgumentException("El curso es requerido");

            if (grupo.ProfesorID == Guid.Empty)
                throw new ArgumentException("El profesor es requerido");

            if (string.IsNullOrWhiteSpace(grupo.Horario))
                throw new ArgumentException("El horario es requerido");

            if (grupo.Cupo == 0)
                throw new ArgumentException("El cupo es requerido");

            if (grupo.PeriodoID == Guid.Empty)
                throw new ArgumentException("El periodo es requerido");
        }
    }
}