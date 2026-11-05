using FluentValidation;
using MicroservicioParametros.Entities;
using MicroservicioParametros.Repository;
using MicroservicioParametros.Services.Clients;
using Microsoft.Data.SqlClient;
using System.Text.Json;

namespace MicroservicioParametros.Services
{
    public class ParametroService : IParametroService
    {
        private readonly IParametroRepository _repository;
        private readonly IAuthServiceValidator _authValidator;
        private readonly IBitacoraServiceClient _bitacoraClient;
        private readonly IValidator<ParametroRequest> _validator;
        private const string Items_Pagina = "PAGSIZE";
        private const int TamanoPaginaDefecto = 15;

        public ParametroService(
            IParametroRepository repository,
            IAuthServiceValidator authValidator,
            IBitacoraServiceClient bitacoraClient,
            IValidator<ParametroRequest> validator)
        {
            _repository = repository;
            _authValidator = authValidator;
            _bitacoraClient = bitacoraClient;
            _validator = validator;
        }

        public async Task<ParametroResponse> CrearAsync(ParametroRequest request, HttpRequest httpRequest)
        {
            var (usuario, token, error) = await _authValidator.ValidarAsync(httpRequest);

            if (error is not null)
                throw new UnauthorizedAccessException("No autorizado");

            var validationResult = await _validator.ValidateAsync(request);

            if (!validationResult.IsValid)
                throw new ValidationException(validationResult.Errors);

            try
            {
                var parametroCreado = await _repository.CrearAsync(request);

                try
                {
                    await _bitacoraClient.RegistrarBitacoraAsync(
                        usuario,
                        $"Se creó el parámetro {parametroCreado.ParametroCode}: " + JsonSerializer.Serialize(parametroCreado),
                        token);
                }
                catch { }

                return parametroCreado;
            }
            catch (SqlException ex)
            {
                try
                {
                    var mensajeBitacora = ex.Number == 50000
                        ? (ex.Message.Contains("Ya existe un parámetro")
                            ? $"Error al crear parámetro {request.ParametroCode}: {ex.Message}"
                            : $"Error de validación al crear parámetro {request.ParametroCode}: {ex.Message}")
                        : $"Error técnico al crear parámetro {request.ParametroCode}: {ex.Message}";

                    await _bitacoraClient.RegistrarBitacoraAsync(usuario, mensajeBitacora, token);
                }
                catch { }

                throw;
            }
            catch (Exception)
            {
                try
                {
                    await _bitacoraClient.RegistrarBitacoraAsync(
                        usuario,
                        $"Error técnico al crear parámetro {request.ParametroCode}",
                        token);
                }
                catch { }

                throw;
            }
        }

        public async Task<ParametroResponse?> ModificarAsync(string parametroCode, ParametroRequest request, HttpRequest httpRequest)
        {
            var (usuario, token, error) = await _authValidator.ValidarAsync(httpRequest);

            if (error is not null)
                throw new UnauthorizedAccessException("No autorizado");

            request.ParametroCode = parametroCode;

            var validationResult = await _validator.ValidateAsync(request);

            if (!validationResult.IsValid)
                throw new ValidationException(validationResult.Errors);

            try
            {
                var parametroAnterior = await _repository.ObtenerPorIDAsync(request.ParametroCode);

                if (parametroAnterior is null)
                    throw new KeyNotFoundException($"No se encontró el parámetro con código '{parametroCode}'.");

                var parametroModificado = await _repository.ModificarAsync(parametroCode, request);

                if (parametroModificado is null)
                {
                    try
                    {
                        await _bitacoraClient.RegistrarBitacoraAsync(
                            usuario,
                            $"Intento de modificar parámetro inexistente: {parametroCode}",
                            token);
                    }
                    catch { }

                    throw new KeyNotFoundException($"No se encontró el parámetro con código '{parametroCode}'.");
                }

                try
                {
                    await _bitacoraClient.RegistrarBitacoraAsync(
                        usuario,
                        $"Se modificó el parámetro {parametroCode}: Original: "
                        + JsonSerializer.Serialize(parametroAnterior)
                        + " Modificado: " + JsonSerializer.Serialize(parametroModificado),
                        token);
                }
                catch { }

                return parametroModificado;
            }
            catch (SqlException ex)
            {
                try
                {
                    var mensajeBitacora = ex.Number == 50000
                        ? $"Error de validación al modificar parámetro {parametroCode}: {ex.Message}"
                        : $"Error técnico al modificar parámetro {parametroCode}: {ex.Message}";

                    await _bitacoraClient.RegistrarBitacoraAsync(usuario, mensajeBitacora, token);
                }
                catch { }

                throw;
            }
            catch (ArgumentException ex)
            {
                try
                {
                    await _bitacoraClient.RegistrarBitacoraAsync(
                        usuario,
                        $"Error al modificar parámetro {parametroCode}: {ex.Message}",
                        token);
                }
                catch { }

                throw;
            }
            catch (KeyNotFoundException)
            {
                throw;
            }
            catch (Exception)
            {
                try
                {
                    await _bitacoraClient.RegistrarBitacoraAsync(
                        usuario,
                        $"Error técnico al modificar parámetro {parametroCode}",
                        token);
                }
                catch { }

                throw;
            }
        }

        public async Task<ParametroResponse?> EliminarAsync(string parametroCode, bool eliminacionFisica, HttpRequest httpRequest)
        {
            var (usuario, token, error) = await _authValidator.ValidarAsync(httpRequest);

            if (error is not null)
                throw new UnauthorizedAccessException("No autorizado");

            if (parametroCode != parametroCode.ToUpperInvariant())
            {
                try
                {
                    await _bitacoraClient.RegistrarBitacoraAsync(
                        usuario,
                        $"Intento de eliminar parámetro con código no en mayúsculas: {parametroCode}",
                        token);
                }
                catch { }

                throw new ArgumentException("El código del parámetro debe estar en mayúsculas.");
            }

            try
            {
                var parametroEliminado = await _repository.EliminarAsync(parametroCode, eliminacionFisica);

                if (parametroEliminado is null)
                {
                    try
                    {
                        await _bitacoraClient.RegistrarBitacoraAsync(
                            usuario,
                            $"Intento de eliminar parámetro inexistente: {parametroCode}",
                            token);
                    }
                    catch { }

                    throw new KeyNotFoundException($"No se encontró el parámetro con código '{parametroCode}'.");
                }

                var tipoEliminacion = eliminacionFisica ? "física" : "lógica";

                try
                {
                    await _bitacoraClient.RegistrarBitacoraAsync(
                        usuario,
                        $"Se eliminó ({tipoEliminacion}) el parámetro {parametroCode}: {JsonSerializer.Serialize(parametroEliminado)}",
                        token);
                }
                catch { }

                return parametroEliminado;
            }
            catch (SqlException ex)
            {
                try
                {
                    var mensajeBitacora = ex.Number == 50000
                        ? $"Error de validación al eliminar parámetro {parametroCode}: {ex.Message}"
                        : $"Error técnico al eliminar parámetro {parametroCode}: {ex.Message}";

                    await _bitacoraClient.RegistrarBitacoraAsync(usuario, mensajeBitacora, token);
                }
                catch { }

                throw;
            }
            catch (ArgumentException ex)
            {
                try
                {
                    await _bitacoraClient.RegistrarBitacoraAsync(
                        usuario,
                        $"Error al eliminar parámetro {parametroCode}: {ex.Message}",
                        token);
                }
                catch { }

                throw;
            }
            catch (KeyNotFoundException)
            {
                throw;
            }
            catch (Exception)
            {
                try
                {
                    await _bitacoraClient.RegistrarBitacoraAsync(
                        usuario,
                        $"Error técnico al eliminar parámetro {parametroCode}",
                        token);
                }
                catch { }

                throw;
            }
        }

        public async Task<ParametroResponse?> ObtenerPorIDAsync(string parametroCode, HttpRequest httpRequest)
        {
            var (usuario, token, error) = await _authValidator.ValidarAsync(httpRequest);

            if (error is not null)
                throw new UnauthorizedAccessException("No autorizado");

            if (parametroCode != parametroCode.ToUpperInvariant())
            {
                try
                {
                    await _bitacoraClient.RegistrarBitacoraAsync(
                        usuario,
                        $"Intento de consulta de parámetro con código no en mayúsculas: {parametroCode}",
                        token);
                }
                catch { }

                throw new ArgumentException("El código del parámetro debe estar en mayúsculas.");
            }

            try
            {
                var parametro = await _repository.ObtenerPorIDAsync(parametroCode);

                if (parametro is null)
                    throw new KeyNotFoundException($"No se encontró el parámetro con código '{parametroCode}'.");

                try
                {
                    await _bitacoraClient.RegistrarBitacoraAsync(usuario, $"Consulta parametro {parametroCode}", token);
                }
                catch { }

                return parametro;
            }
            catch (ArgumentException ex)
            {
                try
                {
                    await _bitacoraClient.RegistrarBitacoraAsync(
                        usuario,
                        $"Error consulta parametro {parametroCode}: {ex.Message}",
                        token);
                }
                catch { }

                throw;
            }
            catch (KeyNotFoundException)
            {
                throw;
            }
            catch (Exception)
            {
                try
                {
                    await _bitacoraClient.RegistrarBitacoraAsync(
                        usuario,
                        $"Error tecnico al obtener parametro {parametroCode}",
                        token);
                }
                catch { }

                throw;
            }
        }

        public async Task<IEnumerable<ParametroResponse>> ObtenerTodosAsync(HttpRequest httpRequest)
        {
            var (usuario, token, error) = await _authValidator.ValidarAsync(httpRequest);

            if (error is not null)
                throw new UnauthorizedAccessException("No autorizado");

            try
            {
                var parametros = await _repository.ObtenerTodosAsync();

                try
                {
                    await _bitacoraClient.RegistrarBitacoraAsync(
                        usuario,
                        "Consulta de todos los parámetros.",
                        token);
                }
                catch { }

                return parametros;
            }
            catch (Exception)
            {
                try
                {
                    await _bitacoraClient.RegistrarBitacoraAsync(
                        usuario,
                        "Error técnico al consultar todos los parámetros",
                        token);
                }
                catch { }

                throw;
            }
        }

        public async Task<PaginaResultado<ParametroResponse>> ObtenerPaginadoAsync(int pagina, HttpRequest httpRequest)
        {
            var (usuario, token, error) = await _authValidator.ValidarAsync(httpRequest);

            if (error is not null)
                throw new UnauthorizedAccessException("No autorizado");

            if (pagina < 1)
                throw new ArgumentException("La pagina debe ser mayor o igual a 1");

            try
            {
                var todos = (await _repository.ObtenerTodosAsync()).ToList();
                var tamano = await ObtenerTamanoPaginaAsync();

                var resultado = Paginar(todos, pagina, tamano);

                try
                {
                    await _bitacoraClient.RegistrarBitacoraAsync(
                        usuario,
                        $"Consulta de parámetros paginada (página {pagina}).",
                        token);
                }
                catch { }

                return resultado;
            }
            catch (Exception)
            {
                try
                {
                    await _bitacoraClient.RegistrarBitacoraAsync(
                        usuario,
                        "Error técnico al consultar parámetros paginados",
                        token);
                }
                catch { }

                throw;
            }
        }

        private async Task<int> ObtenerTamanoPaginaAsync()
        {
            try
            {
                var parametro = await _repository.ObtenerPorIDAsync(Items_Pagina);
                if (parametro is { Estado: true } && int.TryParse(parametro.Valor, out var n) && n > 0)
                    return n;
            }
            catch
            {
                // ignorar y usar default
            }

            return TamanoPaginaDefecto;
        }

        private static PaginaResultado<T> Paginar<T>(List<T> todos, int pagina, int tamano) => new()
        {
            Pagina = pagina,
            TamanoPagina = tamano,
            TotalRegistros = todos.Count,
            TotalPaginas = (int)Math.Ceiling(todos.Count / (double)tamano),
            Datos = todos.Skip((pagina - 1) * tamano).Take(tamano).ToList()
        };
    }
}
