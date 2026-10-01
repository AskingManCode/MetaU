using MicroservicioPeriodos.Entities;
using MicroservicioPeriodos.Services;
using System.Text.Json;

namespace MicroservicioPeriodos
{
    public static class PeriodosEndpoints
    {
        public static void MapPeriodosEndpoints(this WebApplication app)
        {
            app.MapPost("/periodo", Crear);
            app.MapPut("/periodo/{periodoID:int}", Modificar);
            app.MapDelete("/periodo/{periodoID:int}", Eliminar);
            app.MapGet("/periodo", ObtenerTodos);
            app.MapGet("/periodo/{periodoID:int}", ObtenerPorId);
        }

        private static async Task<IResult> Crear(
            PeriodoRequest request,
            HttpRequest httpRequest,
            IPeriodoService service,
            IAuthServiceClient auth,
            IBitacoraServiceClient bitacora)
        {
            var acceso = await ValidarAccesoAsync(httpRequest, auth);

            if (acceso.Error != null)
                return acceso.Error;

            try
            {
                var periodo = new Periodo
                {
                    Anio = request.Anio,
                    NumeroPeriodo = request.NumeroPeriodo,
                    FechaInicio = request.FechaInicio,
                    FechaFin = request.FechaFin
                };

                var creado = await service.CrearAsync(periodo);

                await bitacora.RegistrarAsync(
                    acceso.Usuario,
                    JsonSerializer.Serialize(creado),
                    acceso.Token);

                return Results.Created($"/periodo/{creado.PeriodoID}", creado);
            }
            catch (ArgumentException ex)
            {
                return Results.BadRequest(new { mensaje = ex.Message });
            }
            catch
            {
                await RegistrarErrorAsync(bitacora, acceso.Usuario, acceso.Token);

                return Results.Json(
                    new { mensaje = "Error interno del servidor" },
                    statusCode: 500);
            }
        }

        private static async Task<IResult> Modificar(
            int periodoID,
            PeriodoRequest request,
            HttpRequest httpRequest,
            IPeriodoService service,
            IAuthServiceClient auth,
            IBitacoraServiceClient bitacora)
        {
            var acceso = await ValidarAccesoAsync(httpRequest, auth);

            if (acceso.Error != null)
                return acceso.Error;

            try
            {
                var anterior = await service.ObtenerPorIdAsync(periodoID);

                if (anterior == null)
                    return Results.NotFound(new { mensaje = "El periodo no existe" });

                var periodo = new Periodo
                {
                    PeriodoID = periodoID,
                    Anio = request.Anio,
                    NumeroPeriodo = request.NumeroPeriodo,
                    FechaInicio = request.FechaInicio,
                    FechaFin = request.FechaFin
                };

                await service.ModificarAsync(periodo);

                var descripcion =
                    $"Anterior: {JsonSerializer.Serialize(anterior)} " +
                    $"Actual: {JsonSerializer.Serialize(periodo)}";

                await bitacora.RegistrarAsync(
                    acceso.Usuario,
                    descripcion,
                    acceso.Token);

                return Results.Ok(periodo);
            }
            catch (ArgumentException ex)
            {
                return Results.BadRequest(new { mensaje = ex.Message });
            }
            catch
            {
                await RegistrarErrorAsync(bitacora, acceso.Usuario, acceso.Token);

                return Results.Json(
                    new { mensaje = "Error interno del servidor" },
                    statusCode: 500);
            }
        }

        private static async Task<IResult> Eliminar(
            int periodoID,
            HttpRequest httpRequest,
            IPeriodoService service,
            IAuthServiceClient auth,
            IBitacoraServiceClient bitacora)
        {
            var acceso = await ValidarAccesoAsync(httpRequest, auth);

            if (acceso.Error != null)
                return acceso.Error;

            try
            {
                var periodo = await service.ObtenerPorIdAsync(periodoID);

                if (periodo == null)
                    return Results.NotFound(new { mensaje = "El periodo no existe" });

                await service.EliminarAsync(periodoID);

                await bitacora.RegistrarAsync(
                    acceso.Usuario,
                    JsonSerializer.Serialize(periodo),
                    acceso.Token);

                return Results.Ok(periodo);
            }
            catch
            {
                await RegistrarErrorAsync(bitacora, acceso.Usuario, acceso.Token);

                return Results.Json(
                    new { mensaje = "Error interno del servidor" },
                    statusCode: 500);
            }
        }

        private static async Task<IResult> ObtenerTodos(
            HttpRequest httpRequest,
            IPeriodoService service,
            IAuthServiceClient auth,
            IBitacoraServiceClient bitacora)
        {
            var acceso = await ValidarAccesoAsync(httpRequest, auth);

            if (acceso.Error != null)
                return acceso.Error;

            try
            {
                var periodos = await service.ObtenerTodosAsync();

                await bitacora.RegistrarAsync(
                    acceso.Usuario,
                    "El usuario consulta periodos",
                    acceso.Token);

                return Results.Ok(periodos);
            }
            catch
            {
                await RegistrarErrorAsync(bitacora, acceso.Usuario, acceso.Token);

                return Results.Json(
                    new { mensaje = "Error interno del servidor" },
                    statusCode: 500);
            }
        }

        private static async Task<IResult> ObtenerPorId(
            int periodoID,
            HttpRequest httpRequest,
            IPeriodoService service,
            IAuthServiceClient auth,
            IBitacoraServiceClient bitacora)
        {
            var acceso = await ValidarAccesoAsync(httpRequest, auth);

            if (acceso.Error != null)
                return acceso.Error;

            try
            {
                var periodo = await service.ObtenerPorIdAsync(periodoID);

                if (periodo == null)
                    return Results.NotFound(new { mensaje = "El periodo no existe" });

                await bitacora.RegistrarAsync(
                    acceso.Usuario,
                    "El usuario consulta periodo",
                    acceso.Token);

                return Results.Ok(periodo);
            }
            catch
            {
                await RegistrarErrorAsync(bitacora, acceso.Usuario, acceso.Token);

                return Results.Json(
                    new { mensaje = "Error interno del servidor" },
                    statusCode: 500);
            }
        }

        private static async Task<(string Token, int Usuario, IResult? Error)> ValidarAccesoAsync(
            HttpRequest request,
            IAuthServiceClient auth)
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

        private static async Task RegistrarErrorAsync(
            IBitacoraServiceClient bitacora,
            int usuario,
            string token)
        {
            try
            {
                await bitacora.RegistrarAsync(
                    usuario,
                    "Error tecnico en administracion de periodos",
                    token);
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