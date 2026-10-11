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
            var existente = await _repository.ObtenerPorIdAsync(grupo.GrupoCode);

            if (existente is not null)
                throw new InvalidOperationException("El grupo ya existe");

            ValidarGrupo(grupo);
            await _repository.CrearAsync(grupo);
        }

        public async Task<Grupo> ModificarAsync(Grupo grupo)
        {
            var anterior = await ObtenerPorIdAsync(grupo.GrupoCode);
            grupo.Estado = anterior.Estado;

            ValidarGrupo(grupo);
            await _repository.ModificarAsync(grupo);

            return anterior;
        }

        public async Task<Grupo> EliminarAsync(string grupoCode)
        {
            var grupo = await ObtenerPorIdAsync(grupoCode);
            await _repository.EliminarAsync(grupoCode);
            return grupo;
        }

        public Task<IEnumerable<Grupo>> ObtenerTodosAsync()
        {
            return _repository.ObtenerTodosAsync();
        }

        public async Task<Grupo> ObtenerPorIdAsync(string grupoCode)
        {
            var grupo = await _repository.ObtenerPorIdAsync(grupoCode);

            if (grupo is null)
                throw new KeyNotFoundException("El grupo no existe");

            return grupo;
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