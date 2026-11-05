
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
            app.MapPut("/profesor/{profesorID:guid}", Modificar);
            app.MapDelete("/profesor/{profesorID:guid}", Eliminar);
            app.MapGet("/profesor", ObtenerTodos);
            app.MapGet("/profesor/{profesorID:guid}", ObtenerPorId);
        }

        private static async Task<IResult> Crear(ProfesorRequest request, HttpRequest httpRequest, IProfesorService service, IAuthServiceClient auth, IBitacoraServiceClient bitacora)
        {
            var acceso = await ValidarAccesoAsync(httpRequest, auth);

            if (acceso.Error != null)
                return acceso.Error;

            try
            {
                var profesor = new Profesor
                {
                    UsuarioID = request.UsuarioID,
                    TipoIdentificacionCode = request.TipoIdentificacionCode,
                    Identificacion = request.Identificacion,
                    Email = request.Email,
                    NombreCompleto = request.NombreCompleto,
                    FechaNacimiento = request.FechaNacimiento,
                    Estado = true,
                    Telefonos = request.Telefonos
                };

                var creado = await service.CrearAsync(profesor, acceso.Usuario, acceso.Token);
                await bitacora.RegistrarAsync(acceso.Usuario, JsonSerializer.Serialize(creado), acceso.Token);

                return Results.Created($"/profesor/{creado.ProfesorID}", creado);
            }
            catch (ArgumentException ex)
            {
                return Results.BadRequest(new { mensaje = ex.Message });
            }
            catch(Exception ex)
            {
                System.Diagnostics.Debug.WriteLine(ex.ToString());

                await RegistrarErrorAsync(bitacora, acceso.Usuario, acceso.Token);

                return Results.Json(new { mensaje = "Error interno del servidor" }, statusCode: 500);
            }
        }

        private static async Task<IResult> Modificar(Guid profesorID, ProfesorRequest request, HttpRequest httpRequest, IProfesorService service, IAuthServiceClient auth, IBitacoraServiceClient bitacora)
        {
            var acceso = await ValidarAccesoAsync(httpRequest, auth);

            if (acceso.Error != null)
                return acceso.Error;

            try
            {
                var anterior = await service.ObtenerPorIdAsync(profesorID);

                var profesor = new Profesor
                {
                    ProfesorID = profesorID,
                    UsuarioID = anterior.UsuarioID,
                    TipoIdentificacionCode = request.TipoIdentificacionCode,
                    Identificacion = request.Identificacion,
                    Email = request.Email,
                    NombreCompleto = request.NombreCompleto,
                    FechaNacimiento = request.FechaNacimiento,
                    Estado = anterior.Estado,
                    Telefonos = request.Telefonos
                };

                await service.ModificarAsync(profesor, acceso.Usuario, acceso.Token);

                var descripcion = $"Anterior: {JsonSerializer.Serialize(anterior)} Actual: {JsonSerializer.Serialize(profesor)}";
                await bitacora.RegistrarAsync(acceso.Usuario, descripcion, acceso.Token);

                return Results.Ok(profesor);
            }
            catch (KeyNotFoundException ex)
            {
                return Results.NotFound(new { mensaje = ex.Message });
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

        private static async Task<IResult> Eliminar(Guid profesorID, HttpRequest httpRequest, IProfesorService service, IAuthServiceClient auth, IBitacoraServiceClient bitacora)
        {
            var acceso = await ValidarAccesoAsync(httpRequest, auth);

            if (acceso.Error != null)
                return acceso.Error;

            try
            {
                var profesor = await service.ObtenerPorIdAsync(profesorID);
                await service.EliminarAsync(profesorID);
                await bitacora.RegistrarAsync(acceso.Usuario, JsonSerializer.Serialize(profesor), acceso.Token);

                return Results.Ok(profesor);
            }
            catch (KeyNotFoundException ex)
            {
                return Results.NotFound(new { mensaje = ex.Message });
            }
            catch
            {
                await RegistrarErrorAsync(bitacora, acceso.Usuario, acceso.Token);
                return Results.Json(new { mensaje = "Error interno del servidor" }, statusCode: 500);
            }
        }

        private static async Task<IResult> ObtenerTodos(HttpRequest httpRequest, int? pagina, IProfesorService service, IAuthServiceClient auth, IBitacoraServiceClient bitacora)
        {
            var acceso = await ValidarAccesoAsync(httpRequest, auth);

            if (acceso.Error != null)
                return acceso.Error;

            try
            {
                if (pagina.HasValue)
                {
                    var resultado = await service.ObtenerPaginadoAsync(pagina.Value, acceso.Usuario, acceso.Token);

                    await bitacora.RegistrarAsync(acceso.Usuario, "El usuario consulta profesores", acceso.Token);

                    return Results.Ok(resultado);
                }

                var profesores = await service.ObtenerTodosAsync();
                await bitacora.RegistrarAsync(acceso.Usuario, "El usuario consulta profesores", acceso.Token);

                return Results.Ok(profesores);
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

        private static async Task<IResult> ObtenerPorId(Guid profesorID, HttpRequest httpRequest, IProfesorService service, IAuthServiceClient auth, IBitacoraServiceClient bitacora)
        {
            var acceso = await ValidarAccesoAsync(httpRequest, auth);

            if (acceso.Error != null)
                return acceso.Error;

            try
            {
                var profesor = await service.ObtenerPorIdAsync(profesorID);
                await bitacora.RegistrarAsync(acceso.Usuario, "El usuario consulta profesor", acceso.Token);

                return Results.Ok(profesor);
            }
            catch (KeyNotFoundException ex)
            {
                return Results.NotFound(new { mensaje = ex.Message });
            }
            catch
            {
                await RegistrarErrorAsync(bitacora, acceso.Usuario, acceso.Token);
                return Results.Json(new { mensaje = "Error interno del servidor" }, statusCode: 500);
            }
        }

        private static async Task<(string Token, Guid Usuario, IResult? Error)> ValidarAccesoAsync(HttpRequest request, IAuthServiceClient auth)
        {
            var authorization = request.Headers.Authorization.ToString();

            if (!authorization.StartsWith("Bearer ", StringComparison.OrdinalIgnoreCase))
                return ("", Guid.Empty, Results.Unauthorized());

            var token = authorization["Bearer ".Length..].Trim();

            if (string.IsNullOrWhiteSpace(token) || !await auth.ValidarTokenAsync(token))
                return ("", Guid.Empty, Results.Unauthorized());

            if (!Guid.TryParse(request.Headers["X-Usuario-Id"].ToString(), out var usuario) || usuario == Guid.Empty)
                return ("", Guid.Empty, Results.BadRequest(new { mensaje = "El usuario es requerido" }));

            return (token, usuario, null);
        }

        private static async Task RegistrarErrorAsync(IBitacoraServiceClient bitacora, Guid usuario, string token)
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
        public Guid UsuarioID { get; set; }
        public string TipoIdentificacionCode { get; set; } = string.Empty;
        public string Identificacion { get; set; } = string.Empty;
        public string Email { get; set; } = string.Empty;
        public string NombreCompleto { get; set; } = string.Empty;
        public DateTime FechaNacimiento { get; set; }
        public List<string> Telefonos { get; set; } = new();
    }
}
