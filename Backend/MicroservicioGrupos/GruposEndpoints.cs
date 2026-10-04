using System.Text.Json;
using MicroservicioGrupos.Entities;
using MicroservicioGrupos.Services;
using Microsoft.Data.SqlClient;

namespace MicroservicioGrupos
{
    public static class GruposEndpoints
    {
        public static void MapGruposEndpoints(this WebApplication app)
        {
            app.MapPost("/grupo", CrearAsync);
            app.MapPut("/grupo/{grupoCode}", ModificarAsync);
            app.MapDelete("/grupo/{grupoCode}", EliminarAsync);
            app.MapGet("/grupo", ObtenerTodosAsync);
            app.MapGet("/grupo/{grupoCode}", ObtenerPorIdAsync);
        }

        private static async Task<IResult> CrearAsync(HttpRequest request, GrupoRequest grupoRequest, IGrupoService service, IAuthServiceClient auth, IBitacoraServiceClient bitacora)
        {
            var acceso = await ValidarAccesoAsync(request, auth);
            if (!acceso.Autorizado)
                return Results.Unauthorized();

            try
            {
                if (await service.ObtenerPorIdAsync(grupoRequest.GrupoCode) is not null)
                    return Results.Conflict(new { mensaje = "El grupo ya existe" });

                var grupo = CrearGrupo(grupoRequest);
                await service.CrearAsync(grupo);

                await bitacora.RegistrarAsync(acceso.Usuario, $"Crear grupo: {JsonSerializer.Serialize(grupo)}", acceso.Token);
                return Results.Created($"/grupo/{grupo.GrupoCode}", grupo);
            }
            catch (ArgumentException ex)
            {
                return Results.BadRequest(new { mensaje = ex.Message });
            }
            catch (SqlException ex) when (ex.Number is 2601 or 2627)
            {
                return Results.Conflict(new { mensaje = "Ya existe un grupo con el mismo curso, periodo y numero de grupo" });
            }
            catch (Exception ex)
            {
                await RegistrarErrorAsync(bitacora, acceso, ex);
                return Results.Json(new { mensaje = "Error interno del servidor" }, statusCode: 500);
            }
        }

        private static async Task<IResult> ModificarAsync(string grupoCode, HttpRequest request, GrupoRequest grupoRequest, IGrupoService service, IAuthServiceClient auth, IBitacoraServiceClient bitacora)
        {
            var acceso = await ValidarAccesoAsync(request, auth);
            if (!acceso.Autorizado)
                return Results.Unauthorized();

            try
            {
                if (!grupoCode.Equals(grupoRequest.GrupoCode, StringComparison.OrdinalIgnoreCase))
                    return Results.BadRequest(new { mensaje = "El identificador del grupo no coincide con la ruta" });

                var anterior = await service.ObtenerPorIdAsync(grupoCode);
                if (anterior is null)
                    return Results.NotFound(new { mensaje = "El grupo no existe" });

                var grupo = CrearGrupo(grupoRequest);
                grupo.Estado = anterior.Estado;

                await service.ModificarAsync(grupo);

                await bitacora.RegistrarAsync(acceso.Usuario, $"Modificar grupo: anterior={JsonSerializer.Serialize(anterior)}, actual={JsonSerializer.Serialize(grupo)}", acceso.Token);
                return Results.Ok(grupo);
            }
            catch (ArgumentException ex)
            {
                return Results.BadRequest(new { mensaje = ex.Message });
            }
            catch (Exception ex)
            {
                await RegistrarErrorAsync(bitacora, acceso, ex);
                return Results.Json(new { mensaje = "Error interno del servidor" }, statusCode: 500);
            }
        }

        private static async Task<IResult> EliminarAsync(string grupoCode, HttpRequest request, IGrupoService service, IAuthServiceClient auth, IBitacoraServiceClient bitacora)
        {
            var acceso = await ValidarAccesoAsync(request, auth);
            if (!acceso.Autorizado)
                return Results.Unauthorized();

            try
            {
                var grupo = await service.ObtenerPorIdAsync(grupoCode);
                if (grupo is null)
                    return Results.NotFound(new { mensaje = "El grupo no existe" });

                await service.EliminarAsync(grupoCode);

                await bitacora.RegistrarAsync(acceso.Usuario, $"Eliminar grupo: {JsonSerializer.Serialize(grupo)}", acceso.Token);
                return Results.Ok(grupo);
            }
            catch (Exception ex)
            {
                await RegistrarErrorAsync(bitacora, acceso, ex);
                return Results.Json(new { mensaje = "Error interno del servidor" }, statusCode: 500);
            }
        }

        private static async Task<IResult> ObtenerTodosAsync(HttpRequest request, IGrupoService service, IAuthServiceClient auth, IBitacoraServiceClient bitacora)
        {
            var acceso = await ValidarAccesoAsync(request, auth);
            if (!acceso.Autorizado)
                return Results.Unauthorized();

            try
            {
                var grupos = await service.ObtenerTodosAsync();

                await bitacora.RegistrarAsync(acceso.Usuario, "El usuario consulta grupos", acceso.Token);
                return Results.Ok(grupos);
            }
            catch (Exception ex)
            {
                await RegistrarErrorAsync(bitacora, acceso, ex);
                return Results.Json(new { mensaje = "Error interno del servidor" }, statusCode: 500);
            }
        }

        private static async Task<IResult> ObtenerPorIdAsync(string grupoCode, HttpRequest request, IGrupoService service, IAuthServiceClient auth, IBitacoraServiceClient bitacora)
        {
            var acceso = await ValidarAccesoAsync(request, auth);
            if (!acceso.Autorizado)
                return Results.Unauthorized();

            try
            {
                var grupo = await service.ObtenerPorIdAsync(grupoCode);
                if (grupo is null)
                    return Results.NotFound(new { mensaje = "El grupo no existe" });

                await bitacora.RegistrarAsync(acceso.Usuario, "El usuario consulta un grupo", acceso.Token);
                return Results.Ok(grupo);
            }
            catch (Exception ex)
            {
                await RegistrarErrorAsync(bitacora, acceso, ex);
                return Results.Json(new { mensaje = "Error interno del servidor" }, statusCode: 500);
            }
        }

        private static async Task<(bool Autorizado, string Token, Guid Usuario)> ValidarAccesoAsync(HttpRequest request, IAuthServiceClient auth)
        {
            var authorization = request.Headers.Authorization.ToString();

            if (!authorization.StartsWith("Bearer ", StringComparison.OrdinalIgnoreCase))
                return (false, string.Empty, Guid.Empty);

            var token = authorization["Bearer ".Length..].Trim();

            if (string.IsNullOrWhiteSpace(token) || !await auth.ValidarAsync(token))
                return (false, string.Empty, Guid.Empty);

            if (!Guid.TryParse(request.Headers["X-Usuario-Id"], out var usuario))
                return (false, string.Empty, Guid.Empty);

            return (true, token, usuario);
        }

        private static async Task RegistrarErrorAsync(IBitacoraServiceClient bitacora, (bool Autorizado, string Token, Guid Usuario) acceso, Exception ex)
        {
            try
            {
                await bitacora.RegistrarAsync(acceso.Usuario, $"Error tecnico: {ex.Message}", acceso.Token);
            }
            catch
            {
            }
        }

        private static Grupo CrearGrupo(GrupoRequest request)
        {
            return new Grupo
            {
                GrupoCode = request.GrupoCode,
                NumeroGrupo = request.NumeroGrupo,
                CursoCode = request.CursoCode,
                ProfesorID = request.ProfesorID,
                Horario = request.Horario,
                Cupo = request.Cupo,
                PeriodoID = request.PeriodoID,
                Estado = true
            };
        }
    }

    public class GrupoRequest
    {
        public string GrupoCode { get; set; } = string.Empty;
        public byte NumeroGrupo { get; set; }
        public string CursoCode { get; set; } = string.Empty;
        public Guid ProfesorID { get; set; }
        public string Horario { get; set; } = string.Empty;
        public int Cupo { get; set; }
        public Guid PeriodoID { get; set; }
    }
}