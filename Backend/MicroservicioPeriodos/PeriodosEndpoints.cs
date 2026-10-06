using Microsoft.Data.SqlClient;
using System.Text.Json;
using MicroservicioPeriodos.Entities;
using MicroservicioPeriodos.Services;

namespace MicroservicioPeriodos
{
    public static class PeriodosEndpoints
    {
        public static void MapPeriodosEndpoints(this WebApplication app)
        {
            app.MapPost("/periodo", Crear);
            app.MapPut("/periodo/{periodoID:guid}", Modificar);
            app.MapDelete("/periodo/{periodoID:guid}", Eliminar);
            app.MapGet("/periodo", ObtenerTodos);
            app.MapGet("/periodo/{periodoID:guid}", ObtenerPorId);
        }

        private static async Task<IResult> Crear(HttpContext httpContext, PeriodoRequest request, IPeriodoService service, IAuthServiceClient auth, IBitacoraServiceClient bitacoraService)
        {
            var acceso = await ValidarAccesoAsync(httpContext.Request, auth);
            if (acceso.Error != null) return acceso.Error;

            try
            {
                var periodo = new Periodo
                {
                    Anio = request.Anio,
                    NumeroPeriodo = request.NumeroPeriodo,
                    FechaInicio = request.FechaInicio,
                    FechaFin = request.FechaFin,
                    Estado = true
                };

                var creado = await service.CrearAsync(periodo);
                await bitacoraService.RegistrarAsync(acceso.Usuario, $"Crear periodo: {JsonSerializer.Serialize(creado)}", acceso.Token);
                return Results.Created($"/periodo/{creado.PeriodoID}", creado);
            }
            catch (ArgumentException ex)
            {
                return Results.BadRequest(new { mensaje = ex.Message });
            }
            catch (SqlException ex) when (ex.Number is 2601 or 2627)
            {
                return Results.Conflict(new { mensaje = "Ya existe un periodo con el mismo anio y numero de periodo" });
            }
            catch (Exception ex)
            {
                await RegistrarErrorAsync(bitacoraService, acceso.Usuario, acceso.Token, ex);
                return Results.Json(new { mensaje = "Error interno del servidor" }, statusCode: 500);
            }
        }

        private static async Task<IResult> Modificar(Guid periodoID, HttpContext httpContext, PeriodoRequest request, IPeriodoService service, IAuthServiceClient auth, IBitacoraServiceClient bitacoraService)
        {
            var acceso = await ValidarAccesoAsync(httpContext.Request, auth);
            if (acceso.Error != null) return acceso.Error;

            try
            {
                var anterior = await service.ObtenerPorIdAsync(periodoID);
                if (anterior == null) return Results.NotFound(new { mensaje = "El periodo no existe" });

                var periodo = new Periodo
                {
                    PeriodoID = periodoID,
                    Anio = request.Anio,
                    NumeroPeriodo = request.NumeroPeriodo,
                    FechaInicio = request.FechaInicio,
                    FechaFin = request.FechaFin,
                    Estado = anterior.Estado
                };

                await service.ModificarAsync(periodo);
                await bitacoraService.RegistrarAsync(acceso.Usuario, $"Modificar periodo: anterior={JsonSerializer.Serialize(anterior)}, actual={JsonSerializer.Serialize(periodo)}", acceso.Token);
                return Results.Ok(periodo);
            }
            catch (ArgumentException ex)
            {
                return Results.BadRequest(new { mensaje = ex.Message });
            }
            catch (SqlException ex) when (ex.Number is 2601 or 2627)
            {
                return Results.Conflict(new { mensaje = "Ya existe un periodo con el mismo anio y numero de periodo" });
            }
            catch (Exception ex)
            {
                await RegistrarErrorAsync(bitacoraService, acceso.Usuario, acceso.Token, ex);
                return Results.Json(new { mensaje = "Error interno del servidor" }, statusCode: 500);
            }
        }

        private static async Task<IResult> Eliminar(Guid periodoID, HttpContext httpContext, IPeriodoService service, IAuthServiceClient auth, IBitacoraServiceClient bitacoraService)
        {
            var acceso = await ValidarAccesoAsync(httpContext.Request, auth);
            if (acceso.Error != null) return acceso.Error;

            try
            {
                var periodo = await service.ObtenerPorIdAsync(periodoID);
                if (periodo == null) return Results.NotFound(new { mensaje = "El periodo no existe" });

                await service.EliminarAsync(periodoID);
                await bitacoraService.RegistrarAsync(acceso.Usuario, $"Eliminar periodo: {JsonSerializer.Serialize(periodo)}", acceso.Token);
                return Results.Ok(periodo);
            }
            catch (Exception ex)
            {
                await RegistrarErrorAsync(bitacoraService, acceso.Usuario, acceso.Token, ex);
                return Results.Json(new { mensaje = "Error interno del servidor" }, statusCode: 500);
            }
        }

        private static async Task<IResult> ObtenerTodos(HttpContext httpContext, IPeriodoService service, IAuthServiceClient auth, IBitacoraServiceClient bitacoraService)
        {
            var acceso = await ValidarAccesoAsync(httpContext.Request, auth);
            if (acceso.Error != null) return acceso.Error;

            try
            {
                var periodos = await service.ObtenerTodosAsync();
                await bitacoraService.RegistrarAsync(acceso.Usuario, "El usuario consulta periodos", acceso.Token);
                return Results.Ok(periodos);
            }
            catch (Exception ex)
            {
                await RegistrarErrorAsync(bitacoraService, acceso.Usuario, acceso.Token, ex);
                return Results.Json(new { mensaje = "Error interno del servidor" }, statusCode: 500);
            }
        }

        private static async Task<IResult> ObtenerPorId(Guid periodoID, HttpContext httpContext, IPeriodoService service, IAuthServiceClient auth, IBitacoraServiceClient bitacoraService)
        {
            var acceso = await ValidarAccesoAsync(httpContext.Request, auth);
            if (acceso.Error != null) return acceso.Error;

            try
            {
                var periodo = await service.ObtenerPorIdAsync(periodoID);
                if (periodo == null) return Results.NotFound(new { mensaje = "El periodo no existe" });

                await bitacoraService.RegistrarAsync(acceso.Usuario, "El usuario consulta periodo", acceso.Token);
                return Results.Ok(periodo);
            }
            catch (Exception ex)
            {
                await RegistrarErrorAsync(bitacoraService, acceso.Usuario, acceso.Token, ex);
                return Results.Json(new { mensaje = "Error interno del servidor" }, statusCode: 500);
            }
        }

        private static async Task<(string Token, Guid Usuario, IResult? Error)> ValidarAccesoAsync(HttpRequest request, IAuthServiceClient auth)
        {
            var authorization = request.Headers.Authorization.ToString();
            if (!authorization.StartsWith("Bearer ", StringComparison.OrdinalIgnoreCase)) return ("", Guid.Empty, Results.Unauthorized());

            var token = authorization["Bearer ".Length..].Trim();
            if (string.IsNullOrWhiteSpace(token) || !await auth.ValidarTokenAsync(token)) return ("", Guid.Empty, Results.Unauthorized());

            if (!Guid.TryParse(request.Headers["X-Usuario-Id"], out var usuario) || usuario == Guid.Empty)
                return ("", Guid.Empty, Results.BadRequest(new { mensaje = "El usuario es requerido" }));

            return (token, usuario, null);
        }

        private static async Task RegistrarErrorAsync(IBitacoraServiceClient bitacoraService, Guid usuario, string token, Exception ex)
        {
            try
            {
                await bitacoraService.RegistrarAsync(usuario, $"Error tecnico en administracion de periodos: {ex.Message}", token);
            }
            catch
            {
            }
        }
    }

    public class PeriodoRequest
    {
        public short Anio { get; set; }
        public int NumeroPeriodo { get; set; }
        public DateTime FechaInicio { get; set; }
        public DateTime FechaFin { get; set; }
    }
}