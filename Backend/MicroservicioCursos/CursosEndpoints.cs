using MicroservicioCursos.Entities;
using MicroservicioCursos.Services;
using System.Text.Json;

namespace MicroservicioCursos
{
    public static class CursosEndpoints
    {
        public static void MapCursosEndpoints(this WebApplication app)
        {
            app.MapPost("/curso", CrearAsync);
            app.MapPut("/curso/{cursoCode}", ModificarAsync);
            app.MapDelete("/curso/{cursoCode}", EliminarAsync);
            app.MapGet("/curso", ObtenerTodosAsync);
            app.MapGet("/curso/{cursoCode}", ObtenerPorIdAsync);
            app.MapGet("/curso/carrera/{carreraCode}", ObtenerPorCarreraAsync);
        }

        private static async Task<IResult> CrearAsync(
            CursoRequest request,
            ICursoService service,
            IAuthServiceClient authService,
            IBitacoraServiceClient bitacoraService,
            HttpContext context)
        {
            var acceso = await ValidarAccesoAsync(context, authService);

            if (acceso.Error != null)
                return acceso.Error;

            try
            {
                if (await service.ObtenerPorIdAsync(request.CursoCode) is not null)
                    return Results.Conflict(new { mensaje = "El curso ya existe" });

                var curso = CrearCurso(request);

                await service.CrearAsync(curso);

                await bitacoraService.RegistrarAsync(
                    acceso.Usuario,
                    JsonSerializer.Serialize(curso),
                    acceso.Token);

                return Results.Created(
                    $"/curso/{curso.CursoCode}",
                    curso);
            }
            catch (ArgumentException ex)
            {
                return Results.BadRequest(new { mensaje = ex.Message });
            }
            catch
            {
                await RegistrarErrorAsync(
                    bitacoraService,
                    acceso.Usuario,
                    acceso.Token);

                return Results.Json(
                    new { mensaje = "Error interno del servidor" },
                    statusCode: 500);
            }
        }

        private static async Task<IResult> ModificarAsync(
            string cursoCode,
            CursoRequest request,
            ICursoService service,
            IAuthServiceClient authService,
            IBitacoraServiceClient bitacoraService,
            HttpContext context)
        {
            var acceso = await ValidarAccesoAsync(context, authService);

            if (acceso.Error != null)
                return acceso.Error;

            try
            {
                if (!cursoCode.Equals(
                    request.CursoCode,
                    StringComparison.OrdinalIgnoreCase))
                {
                    return Results.BadRequest(new
                    {
                        mensaje = "El identificador del curso no coincide con la ruta"
                    });
                }

                var anterior = await service.ObtenerPorIdAsync(cursoCode);

                if (anterior is null)
                    return Results.NotFound(new
                    {
                        mensaje = "El curso no existe"
                    });

                var curso = CrearCurso(request);
                curso.Estado = anterior.Estado;

                await service.ModificarAsync(curso);

                var descripcion =
                    $"Anterior: {JsonSerializer.Serialize(anterior)} " +
                    $"Actual: {JsonSerializer.Serialize(curso)}";

                await bitacoraService.RegistrarAsync(
                    acceso.Usuario,
                    descripcion,
                    acceso.Token);

                return Results.Ok(curso);
            }
            catch (ArgumentException ex)
            {
                return Results.BadRequest(new { mensaje = ex.Message });
            }
            catch
            {
                await RegistrarErrorAsync(
                    bitacoraService,
                    acceso.Usuario,
                    acceso.Token);

                return Results.Json(
                    new { mensaje = "Error interno del servidor" },
                    statusCode: 500);
            }
        }

        private static async Task<IResult> EliminarAsync(
            string cursoCode,
            ICursoService service,
            IAuthServiceClient authService,
            IBitacoraServiceClient bitacoraService,
            HttpContext context)
        {
            var acceso = await ValidarAccesoAsync(context, authService);

            if (acceso.Error != null)
                return acceso.Error;

            try
            {
                var curso = await service.ObtenerPorIdAsync(cursoCode);

                if (curso is null)
                    return Results.NotFound(new
                    {
                        mensaje = "El curso no existe"
                    });

                await service.EliminarAsync(cursoCode);

                await bitacoraService.RegistrarAsync(
                    acceso.Usuario,
                    JsonSerializer.Serialize(curso),
                    acceso.Token);

                return Results.Ok(curso);
            }
            catch
            {
                await RegistrarErrorAsync(
                    bitacoraService,
                    acceso.Usuario,
                    acceso.Token);

                return Results.Json(
                    new { mensaje = "Error interno del servidor" },
                    statusCode: 500);
            }
        }

        private static async Task<IResult> ObtenerTodosAsync(
            ICursoService service,
            IAuthServiceClient authService,
            IBitacoraServiceClient bitacoraService,
            HttpContext context)
        {
            var acceso = await ValidarAccesoAsync(context, authService);

            if (acceso.Error != null)
                return acceso.Error;

            try
            {
                var cursos = await service.ObtenerTodosAsync();

                await bitacoraService.RegistrarAsync(
                    acceso.Usuario,
                    "El usuario consulta cursos",
                    acceso.Token);

                return Results.Ok(cursos);
            }
            catch
            {
                await RegistrarErrorAsync(
                    bitacoraService,
                    acceso.Usuario,
                    acceso.Token);

                return Results.Json(
                    new { mensaje = "Error interno del servidor" },
                    statusCode: 500);
            }
        }

        private static async Task<IResult> ObtenerPorIdAsync(
            string cursoCode,
            ICursoService service,
            IAuthServiceClient authService,
            IBitacoraServiceClient bitacoraService,
            HttpContext context)
        {
            var acceso = await ValidarAccesoAsync(context, authService);

            if (acceso.Error != null)
                return acceso.Error;

            try
            {
                var curso = await service.ObtenerPorIdAsync(cursoCode);

                if (curso is null)
                    return Results.NotFound(new
                    {
                        mensaje = "El curso no existe"
                    });

                await bitacoraService.RegistrarAsync(
                    acceso.Usuario,
                    "El usuario consulta curso",
                    acceso.Token);

                return Results.Ok(curso);
            }
            catch
            {
                await RegistrarErrorAsync(
                    bitacoraService,
                    acceso.Usuario,
                    acceso.Token);

                return Results.Json(
                    new { mensaje = "Error interno del servidor" },
                    statusCode: 500);
            }
        }

        private static async Task<IResult> ObtenerPorCarreraAsync(
            string carreraCode,
            ICursoService service,
            IAuthServiceClient authService,
            IBitacoraServiceClient bitacoraService,
            HttpContext context)
        {
            var acceso = await ValidarAccesoAsync(context, authService);

            if (acceso.Error != null)
                return acceso.Error;

            try
            {
                if (string.IsNullOrWhiteSpace(carreraCode))
                    return Results.BadRequest(new
                    {
                        mensaje = "La carrera es requerida"
                    });

                var cursos = await service.ObtenerPorCarreraAsync(
                    carreraCode);

                await bitacoraService.RegistrarAsync(
                    acceso.Usuario,
                    "El usuario consulta cursos por carrera",
                    acceso.Token);

                return Results.Ok(cursos);
            }
            catch (ArgumentException ex)
            {
                return Results.BadRequest(new { mensaje = ex.Message });
            }
            catch
            {
                await RegistrarErrorAsync(
                    bitacoraService,
                    acceso.Usuario,
                    acceso.Token);

                return Results.Json(
                    new { mensaje = "Error interno del servidor" },
                    statusCode: 500);
            }
        }

        private static Curso CrearCurso(CursoRequest request)
        {
            return new Curso
            {
                CursoCode = request.CursoCode,
                CarreraCode = request.CarreraCode,
                Nombre = request.Nombre,
                Nivel = request.Nivel,
                Estado = true
            };
        }

        private static async Task<(string Token, Guid Usuario, IResult? Error)> ValidarAccesoAsync(
            HttpContext context,
            IAuthServiceClient authService)
        {
            var authorization =
                context.Request.Headers.Authorization.ToString();

            if (!authorization.StartsWith(
                "Bearer ",
                StringComparison.OrdinalIgnoreCase))
            {
                return ("", Guid.Empty, Results.Unauthorized());
            }

            var token = authorization["Bearer ".Length..].Trim();

            if (string.IsNullOrWhiteSpace(token) ||
                !await authService.ValidarTokenAsync(token))
            {
                return ("", Guid.Empty, Results.Unauthorized());
            }

            if (!Guid.TryParse(
                context.Request.Headers["X-Usuario-Id"],
                out var usuario) ||
                usuario == Guid.Empty)
            {
                return (
                    "",
                    Guid.Empty,
                    Results.BadRequest(new
                    {
                        mensaje = "El usuario es requerido"
                    }));
            }

            return (token, usuario, null);
        }

        private static async Task RegistrarErrorAsync(
            IBitacoraServiceClient bitacoraService,
            Guid usuario,
            string token)
        {
            try
            {
                await bitacoraService.RegistrarAsync(
                    usuario,
                    "Error tecnico en administracion de cursos",
                    token);
            }
            catch
            {
            }
        }
    }

    public class CursoRequest
    {
        public string CursoCode { get; set; } = string.Empty;
        public string CarreraCode { get; set; } = string.Empty;
        public string Nombre { get; set; } = string.Empty;
        public byte Nivel { get; set; }
    }
}