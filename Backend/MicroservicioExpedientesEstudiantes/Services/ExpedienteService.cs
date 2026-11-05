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
        private readonly ILogger<ExpedienteService> _logger;
        private const string ParametroPaginacion = "PAGSIZE";
        private const int TamanoPaginaDefecto = 15;

        private static readonly Regex SoloLetrasYEspacios =
            new(@"^[\p{L}\s]+$", RegexOptions.Compiled);

        private static readonly Regex FormatoEmail =
            new(@"^[^@\s]+@[^@\s]+\.[^@\s]+$", RegexOptions.Compiled);

        private static readonly Regex EspaciosRepetidos =
            new(@"\s{2,}", RegexOptions.Compiled);

        private static readonly Regex TelefonoValido =
            new(@"^\d{8}$", RegexOptions.Compiled);

        public ExpedienteService(
            IExpedienteRepository repository,
            IParametroClient parametroClient,
            IBitacoraClient bitacoraClient,
            ILogger<ExpedienteService> logger)
        {
            _repository = repository;
            _parametroClient = parametroClient;
            _bitacoraClient = bitacoraClient;
            _logger = logger;
        }

        public async Task<Estudiante> Crear(EstudianteRequest request, ContextoUsuario contexto)
        {
            Normalizar(request);
            await ValidarDatosRequeridos(request, request.Identificacion, contexto);

            if (await _repository.Existe(request.Identificacion))
                throw new ConflictoException("Ya existe un expediente con esa identificación.");

            var estudiante = MapearAEntidad(request, Guid.NewGuid());

            var creado = await _repository.Reactivar(estudiante)
                ?? await _repository.Insertar(estudiante);

            await RegistrarBitacora(contexto,
                $"Se creó el expediente {creado.Identificacion}: " + JsonSerializer.Serialize(creado));
            return creado;
        }

        public async Task<Estudiante> Modificar(string identificacion, EstudianteRequest request, ContextoUsuario contexto)
        {
            identificacion = identificacion.Trim();

            var anterior = await _repository.BuscarPorId(identificacion)
                ?? throw new NoEncontradoException("No existe un expediente con esa identificación.");

            Normalizar(request);
            await ValidarDatosRequeridos(request, identificacion, contexto);

            var actualizado = MapearAEntidad(request, anterior.EstudianteID);
            actualizado.Identificacion = identificacion;

            var resultado = await _repository.Actualizar(actualizado)
                ?? throw new NoEncontradoException("No existe un expediente con esa identificación.");

            await RegistrarBitacora(contexto,
                $"Se modificó el expediente {identificacion}: " +
                JsonSerializer.Serialize(new { anterior, actual = resultado }));
            return resultado;
        }

        public async Task Eliminar(string identificacion, ContextoUsuario contexto)
        {
            identificacion = identificacion.Trim();

            var existente = await _repository.BuscarPorId(identificacion)
                ?? throw new NoEncontradoException("No existe un expediente con esa identificación.");

            await _repository.Eliminar(identificacion);
            await RegistrarBitacora(contexto,
                $"Se eliminó el expediente {identificacion}: " + JsonSerializer.Serialize(existente));
        }

        public async Task<List<Estudiante>> ObtenerTodos(ContextoUsuario contexto)
        {
            var lista = await _repository.ListarTodos();
            await RegistrarBitacora(contexto, "El usuario consulta expedientes de estudiantes");
            return lista;
        }

public async Task<PaginaResultado<Estudiante>> ObtenerTodosPaginado(
    int pagina, ContextoUsuario contexto)
{
    if (pagina < 1)
        throw new ValidacionException("La página debe ser mayor o igual a 1.");

    var estudiantes = (await ObtenerTodos(contexto))
        .OrderBy(e => e.NombreCompleto, StringComparer.OrdinalIgnoreCase)
        .ThenBy(e => e.Identificacion, StringComparer.Ordinal)
        .ThenBy(e => e.EstudianteID)
        .ToList();

    var tamano = TamanoPaginaDefecto;
    try
    {
        var valor = await _parametroClient.ObtenerValorPaginacion(ParametroPaginacion, contexto);
        if (int.TryParse(valor, out var configurado) && configurado > 0)
            tamano = Math.Min(configurado, TamanoPaginaDefecto);

        _logger.LogInformation("Paginación de expedientes: PAGSIZE={Valor}, tamaño aplicado={Tamano}",
            valor ?? "No disponible", tamano);
    }
    catch (TaskCanceledException ex)
    {
        _logger.LogWarning(ex, "Tiempo de espera agotado al consultar PAGSIZE. Se utilizará el valor por defecto");
    }

    var inicio = ((long)pagina - 1) * tamano;
    var datos = inicio >= estudiantes.Count
        ? new List<Estudiante>()
        : estudiantes.Skip((int)inicio).Take(tamano).ToList();

    return new PaginaResultado<Estudiante>
    {
        Pagina = pagina,
        TamanoPagina = tamano,
        TotalRegistros = estudiantes.Count,
        TotalPaginas = (int)Math.Ceiling(estudiantes.Count / (double)tamano),
        Datos = datos
    };
}

        public async Task<Estudiante> ObtenerPorId(string identificacion, ContextoUsuario contexto)
        {
            identificacion = identificacion.Trim();

            var estudiante = await _repository.BuscarPorId(identificacion)
                ?? throw new NoEncontradoException(
                    "No existe un expediente con esa identificación.");

            await RegistrarBitacora(
                contexto,
                $"El usuario consulta expediente {identificacion}");

            return estudiante;
        }

        private async Task RegistrarBitacora(ContextoUsuario contexto, string descripcion)
        {
            try
            {
                await _bitacoraClient.Registrar(contexto, descripcion);
            }
            catch
            {
            }
        }

        private async Task ValidarDatosRequeridos(
            EstudianteRequest request, string identificacionExcluirEmail, ContextoUsuario contexto)
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

            if (request.Telefonos.Any(telefono => !TelefonoValido.IsMatch(telefono)))
                throw new ValidacionException("Cada teléfono debe contener exactamente 8 dígitos.");

            if (request.FechaNacimiento > DateOnly.FromDateTime(DateTime.Today))
                throw new ValidacionException("La fecha de nacimiento no puede estar en el futuro.");

            if (!SoloLetrasYEspacios.IsMatch(request.NombreCompleto))
                throw new ValidacionException("El nombre completo solo puede contener letras y espacios.");

            if (!FormatoEmail.IsMatch(request.Email))
                throw new ValidacionException("El formato del email no es válido.");

            var dominio = await _parametroClient.ObtenerValor("DOMEST", contexto);
            if (!request.Email.EndsWith("@" + dominio, StringComparison.OrdinalIgnoreCase))
                throw new ValidacionException($"El email debe pertenecer al dominio {dominio}.");

            if (await _repository.ExisteEmail(request.Email, identificacionExcluirEmail))
                throw new ConflictoException($"Ya existe un estudiante con el email {request.Email}.");
        }

        private static void Normalizar(EstudianteRequest request)
        {
            request.Identificacion = request.Identificacion?.Trim() ?? string.Empty;
            request.TipoIdentificacion = request.TipoIdentificacion?.Trim() ?? string.Empty;
            request.Email = request.Email?.Trim() ?? string.Empty;
            request.NombreCompleto = ColapsarEspacios(request.NombreCompleto);
            request.OtrasSenas = ColapsarEspacios(request.OtrasSenas);
            request.Telefonos = (request.Telefonos ?? new List<string>())
                .Select(t => t?.Trim() ?? string.Empty)
                .Distinct()
                .ToList();
        }

        private static string ColapsarEspacios(string? valor) =>
            string.IsNullOrWhiteSpace(valor) ? string.Empty : EspaciosRepetidos.Replace(valor.Trim(), " ");

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
