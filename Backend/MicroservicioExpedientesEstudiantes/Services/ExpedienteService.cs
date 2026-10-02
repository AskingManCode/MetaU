using System.Text.Json;
using System.Text.RegularExpressions;
using MicroservicioExpedientesEstudiantes.Entities;
using MicroservicioExpedientesEstudiantes.Repository;

namespace MicroservicioExpedientesEstudiantes.Services
{
    public class ExpedienteService : IExpedienteService
    {
        private readonly IExpedienteRepository _repository;
        private readonly IParametroClient _parametroClient;
        private readonly IBitacoraClient _bitacoraClient;

        private static readonly Regex SoloLetrasYEspacios =
            new(@"^[\p{L}\s]+$", RegexOptions.Compiled);

        private static readonly Regex FormatoEmail =
            new(@"^[^@\s]+@[^@\s]+\.[^@\s]+$", RegexOptions.Compiled);

        public ExpedienteService(
            IExpedienteRepository repository,
            IParametroClient parametroClient,
            IBitacoraClient bitacoraClient)
        {
            _repository = repository;
            _parametroClient = parametroClient;
            _bitacoraClient = bitacoraClient;
        }

        public async Task<Estudiante> Crear(EstudianteRequest request, ContextoUsuario contexto)
        {
            await ValidarDatosRequeridos(request, esCreacion: true, identificacionOriginal: null);

            if (await _repository.Existe(request.Identificacion))
                throw new ConflictoException("Ya existe un expediente con esa identificación.");

            var estudiante = MapearAEntidad(request, Guid.NewGuid());
            var creado = await _repository.Insertar(estudiante);

            await _bitacoraClient.Registrar(contexto, JsonSerializer.Serialize(creado));
            return creado;
        }

        public async Task<Estudiante> Modificar(string identificacion, EstudianteRequest request, ContextoUsuario contexto)
        {
            var anterior = await _repository.BuscarPorId(identificacion)
                ?? throw new NoEncontradoException("No existe un expediente con esa identificación.");

            await ValidarDatosRequeridos(request, esCreacion: false, identificacionOriginal: identificacion);

            var actualizado = MapearAEntidad(request, anterior.EstudianteID);
            actualizado.Identificacion = identificacion;

            var resultado = await _repository.Actualizar(actualizado)
                ?? throw new NoEncontradoException("No existe un expediente con esa identificación.");

            await _bitacoraClient.Registrar(contexto, JsonSerializer.Serialize(new { anterior, actual = resultado }));
            return resultado;
        }

        public async Task Eliminar(string identificacion, ContextoUsuario contexto)
        {
            var existente = await _repository.BuscarPorId(identificacion)
                ?? throw new NoEncontradoException("No existe un expediente con esa identificación.");

            await _repository.Eliminar(identificacion);
            await _bitacoraClient.Registrar(contexto, JsonSerializer.Serialize(existente));
        }

        public async Task<List<Estudiante>> ObtenerTodos(ContextoUsuario contexto)
        {
            var lista = await _repository.ListarTodos();
            await _bitacoraClient.Registrar(contexto, "El usuario consulta expedientes de estudiantes");
            return lista;
        }

        public async Task<Estudiante?> ObtenerPorId(string identificacion, ContextoUsuario contexto)
        {
            var estudiante = await _repository.BuscarPorId(identificacion);
            await _bitacoraClient.Registrar(contexto, $"El usuario consulta expediente {identificacion}");
            return estudiante;
        }

        private async Task ValidarDatosRequeridos(EstudianteRequest request, bool esCreacion, string? identificacionOriginal)
        {
            if (EsVacioOEnBlanco(request.Identificacion) ||
                EsVacioOEnBlanco(request.TipoIdentificacion) ||
                EsVacioOEnBlanco(request.Email) ||
                EsVacioOEnBlanco(request.NombreCompleto) ||
                EsVacioOEnBlanco(request.OtrasSenas) ||
                request.ProvinciaID == Guid.Empty ||
                request.CantonID == Guid.Empty ||
                request.DistritoID == Guid.Empty ||
                request.FechaNacimiento == default)
            {
                throw new ValidacionException("Todos los datos son requeridos y no pueden ser vacíos ni espacios en blanco.");
            }

            if (request.Telefonos.Count == 0 || request.Telefonos.Any(EsVacioOEnBlanco))
                throw new ValidacionException("Debe indicarse al menos un teléfono y ninguno puede estar vacío.");

            if (!SoloLetrasYEspacios.IsMatch(request.NombreCompleto))
                throw new ValidacionException("El nombre completo solo puede contener letras y espacios.");

            if (!FormatoEmail.IsMatch(request.Email))
                throw new ValidacionException("El formato del email no es válido.");

            var dominio = await _parametroClient.ObtenerValor("DOMEST");
            if (!request.Email.EndsWith("@" + dominio, StringComparison.OrdinalIgnoreCase))
                throw new ValidacionException($"El email debe pertenecer al dominio {dominio}.");

            if (await _repository.ExisteEmail(request.Email, esCreacion ? null : identificacionOriginal))
                throw new ConflictoException($"Ya existe un estudiante con el email {request.Email}.");
        }

        private static bool EsVacioOEnBlanco(string valor) => string.IsNullOrWhiteSpace(valor);

        private static Estudiante MapearAEntidad(EstudianteRequest request, Guid estudianteId) => new()
        {
            EstudianteID = estudianteId,
            Identificacion = request.Identificacion,
            TipoIdentificacion = request.TipoIdentificacion,
            Email = request.Email,
            NombreCompleto = request.NombreCompleto,
            FechaNacimiento = request.FechaNacimiento,
            Direccion = new Direccion
            {
                ProvinciaID = request.ProvinciaID,
                CantonID = request.CantonID,
                DistritoID = request.DistritoID,
                OtrasSenas = request.OtrasSenas
            },
            Telefonos = request.Telefonos
                .Select(numero => new Telefono { EstudianteID = estudianteId, Numero = numero })
                .ToList()
        };
    }
}
