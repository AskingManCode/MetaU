using System.Text.Json;
using MicroservicioNotas.Entities;
using MicroservicioNotas.Repository;

namespace MicroservicioNotas.Services
{
    public class NotaService : INotaService
    {
        private readonly INotaRepository _repository;
        private readonly IGrupoClient _grupoClient;
        private readonly IExpedienteClient _expedienteClient;
        private readonly IParametroClient _parametroClient;
        private readonly IBitacoraClient _bitacoraClient;

        public NotaService(
            INotaRepository repository,
            IGrupoClient grupoClient,
            IExpedienteClient expedienteClient,
            IParametroClient parametroClient,
            IBitacoraClient bitacoraClient)
        {
            _repository = repository;
            _grupoClient = grupoClient;
            _expedienteClient = expedienteClient;
            _parametroClient = parametroClient;
            _bitacoraClient = bitacoraClient;
        }

        public async Task<List<Rubro>> CargarDesglose(DesgloseRequest request, ContextoUsuario contexto)
        {
            if (string.IsNullOrWhiteSpace(request.GrupoCode) || request.Rubros.Count == 0)
                throw new ValidacionException("Debe indicarse el grupo y al menos un rubro.");

            if (request.Rubros.Any(r => string.IsNullOrWhiteSpace(r.Nombre) || r.Porcentaje <= 0))
                throw new ValidacionException("Todos los rubros requieren nombre y un porcentaje mayor a cero.");

            var grupo = await _grupoClient.ObtenerPorCodigo(request.GrupoCode)
                ?? throw new ValidacionException($"El grupo {request.GrupoCode} no existe.");

            var total = await _parametroClient.ObtenerValorNumerico("TOTRUBRO");
            if (request.Rubros.Sum(r => r.Porcentaje) != total)
                throw new ValidacionException($"La sumatoria de los rubros debe sumar siempre {total}.");

            if (await _repository.ExistenNotasEnGrupo(request.GrupoCode))
                throw new ConflictoException("No es posible modificar los rubros: ya hay notas asignadas para este grupo.");

            var rubros = request.Rubros.Select(r => new Rubro
            {
                GrupoCode = request.GrupoCode,
                CursoCode = grupo.CursoCode,
                Nombre = r.Nombre,
                Porcentaje = r.Porcentaje
            }).ToList();

            await _repository.ReemplazarDesglose(request.GrupoCode, rubros);
            await _bitacoraClient.Registrar(contexto, JsonSerializer.Serialize(rubros));
            return rubros;
        }

        public async Task<NotaRubro> AsignarNotaRubro(NotaRubroRequest request, ContextoUsuario contexto)
        {
            var nota = await ValidarYMapear(request, contexto);

            var existente = await _repository.ObtenerNota(request.IdRubro, request.Identificacion);
            if (existente is not null)
                throw new ConflictoException("Ya existe una nota para ese rubro y estudiante; use modificar en vez de asignar.");

            var creada = await _repository.InsertarNota(nota);
            await _bitacoraClient.Registrar(contexto, JsonSerializer.Serialize(creada));
            return creada;
        }

        public async Task<NotaRubro> ModificarNotaRubro(NotaRubroRequest request, ContextoUsuario contexto)
        {
            var nota = await ValidarYMapear(request, contexto);

            var anterior = await _repository.ObtenerNota(request.IdRubro, request.Identificacion)
                ?? throw new NoEncontradoException("No existe una nota para ese rubro y estudiante.");

            var actualizada = await _repository.ActualizarNota(nota)
                ?? throw new NoEncontradoException("No existe una nota para ese rubro y estudiante.");

            await _bitacoraClient.Registrar(contexto, JsonSerializer.Serialize(new { anterior, actual = actualizada }));
            return actualizada;
        }

        public async Task<List<Rubro>> ObtenerDesglose(string grupoCode, ContextoUsuario contexto)
        {
            var rubros = await _repository.ListarRubrosPorGrupo(grupoCode);
            await _bitacoraClient.Registrar(contexto, $"El usuario consulta desglose del grupo {grupoCode}");
            return rubros;
        }

        public async Task<List<NotaRubro>> ObtenerNotas(string identificacion, string cursoCode, ContextoUsuario contexto)
        {
            var notas = await _repository.ListarNotas(identificacion, cursoCode);
            await _bitacoraClient.Registrar(contexto, $"El usuario consulta notas de {identificacion} en curso {cursoCode}");
            return notas;
        }

        private async Task<NotaRubro> ValidarYMapear(NotaRubroRequest request, ContextoUsuario contexto)
        {
            if (string.IsNullOrWhiteSpace(request.Identificacion))
                throw new ValidacionException("Debe indicarse la identificación del estudiante.");

            _ = await _repository.ObtenerRubro(request.IdRubro)
                ?? throw new ValidacionException($"El rubro {request.IdRubro} no existe.");

            if (!await _expedienteClient.Existe(request.Identificacion, contexto))
                throw new ValidacionException($"El estudiante {request.Identificacion} no existe.");

            var min = await _parametroClient.ObtenerValorNumerico("NOTAMIN");
            var max = await _parametroClient.ObtenerValorNumerico("NOTAMAX");
            if (request.Nota < min || request.Nota > max)
                throw new ValidacionException($"La nota debe estar entre {min} y {max}.");

            return new NotaRubro
            {
                IdRubro = request.IdRubro,
                Identificacion = request.Identificacion,
                Nota = request.Nota
            };
        }
    }
}
