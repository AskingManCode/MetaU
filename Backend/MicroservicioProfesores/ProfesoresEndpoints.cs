using MicroservicioProfesores.Entities;
using MicroservicioProfesores.Services;
using System.Text.Json;

namespace MicroservicioProfesores
{
    public static class ProfesoresEndpoints
    {
        public static void MapProfesoresEndpoints(this WebApplication app)
        {
            app.MapPost("/profesor", Crear);
            app.MapPut("/profesor/{profesorID:int}", Modificar);
            app.MapDelete("/profesor/{profesorID:int}", Eliminar);
            app.MapGet("/profesor", ObtenerTodos);
            app.MapGet("/profesor/{profesorID:int}", ObtenerPorId);
        }

        private static async Task<IResult> Crear(ProfesorRequest request, HttpRequest httpRequest, IProfesorService service, IAuthServiceClient auth, IBitacoraServiceClient bitacora, IParametroServiceClient parametros, IConfiguration configuration)
        {
            var acceso = await ValidarAccesoAsync(httpRequest, auth);
            if (acceso.Error != null)
                return acceso.Error;

            try
            {
                var dominio = await ObtenerDominioAsync(parametros, configuration, acceso.Token);
                var profesor = new Profesor
                {
                    TipoIdentificacionCode = request.TipoIdentificacionCode,
                    Identificacion = request.Identificacion,
                    Email = request.Email,
                    NombreCompleto = request.NombreCompleto,
                    FechaNacimiento = request.FechaNacimiento,
                    Telefonos = request.Telefonos
                };

                var creado = await service.CrearAsync(profesor, dominio);
                await bitacora.RegistrarAsync(acceso.Usuario, JsonSerializer.Serialize(creado), acceso.Token);

                return Results.Created($"/profesor/{creado.ProfesorID}", creado);
            }
            catch (ArgumentException ex)
            {
                return Results.BadRequest(new { mensaje = ex.Message });
            }
            catch
            {
                await RegistrarErrorAsync(bitacora, acceso.Usuario, acceso.Token);
                return Results.Json(new { mensaje = "Error interno del servidor" }, statusCode: 500);
            }
        }

        private static async Task<IResult> Modificar(int profesorID, ProfesorRequest request, HttpRequest httpRequest, IProfesorService service, IAuthServiceClient auth, IBitacoraServiceClient bitacora, IParametroServiceClient parametros, IConfiguration configuration)
        {
            var acceso = await ValidarAccesoAsync(httpRequest, auth);
            if (acceso.Error != null)
                return acceso.Error;

            try
            {
                var anterior = await service.ObtenerPorIdAsync(profesorID);
                if (anterior == null)
                    return Results.NotFound(new { mensaje = "El profesor no existe" });

                var dominio = await ObtenerDominioAsync(parametros, configuration, acceso.Token);
                var profesor = new Profesor
                {
                    ProfesorID = profesorID,
                    TipoIdentificacionCode = request.TipoIdentificacionCode,
                    Identificacion = request.Identificacion,
                    Email = request.Email,
                    NombreCompleto = request.NombreCompleto,
                    FechaNacimiento = request.FechaNacimiento,
                    Telefonos = request.Telefonos
                };

                await service.ModificarAsync(profesor, dominio);

                var descripcion = $"Anterior: {JsonSerializer.Serialize(anterior)} Actual: {JsonSerializer.Serialize(profesor)}";
                await bitacora.RegistrarAsync(acceso.Usuario, descripcion, acceso.Token);

                return Results.Ok(profesor);
            }
            catch (ArgumentException ex)
            {
                return Results.BadRequest(new { mensaje = ex.Message });
            }
            catch
            {
                await RegistrarErrorAsync(bitacora, acceso.Usuario, acceso.Token);
                return Results.Json(new { mensaje = "Error interno del servidor" }, statusCode: 500);
            }
        }

        private static async Task<IResult> Eliminar(int profesorID, HttpRequest httpRequest, IProfesorService service, IAuthServiceClient auth, IBitacoraServiceClient bitacora)
        {
            var acceso = await ValidarAccesoAsync(httpRequest, auth);
            if (acceso.Error != null)
                return acceso.Error;

            try
            {
                var profesor = await service.ObtenerPorIdAsync(profesorID);
                if (profesor == null)
                    return Results.NotFound(new { mensaje = "El profesor no existe" });

                await service.EliminarAsync(profesorID);
                await bitacora.RegistrarAsync(acceso.Usuario, JsonSerializer.Serialize(profesor), acceso.Token);

                return Results.Ok(profesor);
            }
            catch
            {
                await RegistrarErrorAsync(bitacora, acceso.Usuario, acceso.Token);
                return Results.Json(new { mensaje = "Error interno del servidor" }, statusCode: 500);
            }
        }

        private static async Task<IResult> ObtenerTodos(HttpRequest httpRequest, IProfesorService service, IAuthServiceClient auth, IBitacoraServiceClient bitacora)
        {
            var acceso = await ValidarAccesoAsync(httpRequest, auth);
            if (acceso.Error != null)
                return acceso.Error;

            try
            {
                var profesores = await service.ObtenerTodosAsync();
                await bitacora.RegistrarAsync(acceso.Usuario, "El usuario consulta profesores", acceso.Token);

                return Results.Ok(profesores);
            }
            catch
            {
                await RegistrarErrorAsync(bitacora, acceso.Usuario, acceso.Token);
                return Results.Json(new { mensaje = "Error interno del servidor" }, statusCode: 500);
            }
        }

        private static async Task<IResult> ObtenerPorId(int profesorID, HttpRequest httpRequest, IProfesorService service, IAuthServiceClient auth, IBitacoraServiceClient bitacora)
        {
            var acceso = await ValidarAccesoAsync(httpRequest, auth);
            if (acceso.Error != null)
                return acceso.Error;

            try
            {
                var profesor = await service.ObtenerPorIdAsync(profesorID);
                if (profesor == null)
                    return Results.NotFound(new { mensaje = "El profesor no existe" });

                await bitacora.RegistrarAsync(acceso.Usuario, "El usuario consulta profesor", acceso.Token);

                return Results.Ok(profesor);
            }
            catch
            {
                await RegistrarErrorAsync(bitacora, acceso.Usuario, acceso.Token);
                return Results.Json(new { mensaje = "Error interno del servidor" }, statusCode: 500);
            }
        }

        private static async Task<(string Token, int Usuario, IResult? Error)> ValidarAccesoAsync(HttpRequest request, IAuthServiceClient auth)
        {
            var authorization = request.Headers.Authorization.ToString();

            if (!authorization.StartsWith("Bearer ", StringComparison.OrdinalIgnoreCase))
                return ("", 0, Results.Unauthorized());

            var token = authorization["Bearer ".Length..].Trim();

            if (string.IsNullOrWhiteSpace(token) || !await auth.ValidarTokenAsync(token))
                return ("", 0, Results.Unauthorized());

            if (!int.TryParse(request.Headers["X-Usuario-Id"], out var usuario) || usuario <= 0)
                return ("", 0, Results.BadRequest(new { mensaje = "El usuario es requerido" }));

            return (token, usuario, null);
        }

        private static async Task<string> ObtenerDominioAsync(IParametroServiceClient parametros, IConfiguration configuration, string token)
        {
            var identificador = configuration["Parametros:IdentificadorDominioProfesor"];

            if (string.IsNullOrWhiteSpace(identificador))
                throw new InvalidOperationException("No se configuro el identificador del dominio del profesor");

            var dominio = await parametros.ObtenerValorAsync(identificador, token);

            if (string.IsNullOrWhiteSpace(dominio))
                throw new InvalidOperationException("No se encontro el dominio del profesor");

            return dominio;
        }

        private static async Task RegistrarErrorAsync(IBitacoraServiceClient bitacora, int usuario, string token)
        {
            try
            {
                await bitacora.RegistrarAsync(usuario, "Error tecnico en administracion de profesores", token);
            }
            catch
            {
            }
        }
    }

    public class ProfesorRequest
    {
        public string TipoIdentificacionCode { get; set; } = string.Empty;
        public string Identificacion { get; set; } = string.Empty;
        public string Email { get; set; } = string.Empty;
        public string NombreCompleto { get; set; } = string.Empty;
        public DateTime FechaNacimiento { get; set; }
        public List<string> Telefonos { get; set; } = new();
    }
}