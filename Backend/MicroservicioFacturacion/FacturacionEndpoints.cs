using MicroservicioFacturacion.Entities;
using MicroservicioFacturacion.Services;

namespace MicroservicioFacturacion
{
    public static class FacturacionEndpoints
    {
        public static void MapFacturacionEndpoints(this WebApplication app)
        {
            var group = app.MapGroup("/api/factura");

            group.MapPost("/", Crear);
            group.MapPatch("/{FacturaID}", Anular);
            group.MapGet("/{FacturaID}", ObtenerPorID);
            group.MapGet("/periodo/{PeriodoID}", ObtenerPorPeriodo);
        }

        private static async Task<IResult> Crear(
            FacturacionRequest request,
            HttpRequest httpRequest,
            IFacturacionService service)
        {
            try
            {
                var factura = await service.CrearAsync(request, httpRequest);
                return Results.Created($"/api/factura/{factura.FacturaID}", factura);
            }
            catch (UnauthorizedAccessException)
            {
                return Results.Unauthorized();
            }
            catch (ArgumentException ex)
            {
                return Results.BadRequest(new { mensaje = ex.Message });
            }
            catch (KeyNotFoundException ex)
            {
                return Results.NotFound(new { mensaje = ex.Message });
            }
            catch (InvalidOperationException ex)
            {
                return Results.Conflict(new { mensaje = ex.Message });
            }
            catch (Exception)
            {
                return Results.Json(new { mensaje = "Error interno del servidor" }, statusCode: 500);
            }
        }

        private static async Task<IResult> Anular(
            Guid FacturaID,
            HttpRequest httpRequest,
            IFacturacionService service)
        {
            try
            {
                var factura = await service.AnularAsync(FacturaID, httpRequest);
                return Results.Ok(factura);
            }
            catch (UnauthorizedAccessException)
            {
                return Results.Unauthorized();
            }
            catch (KeyNotFoundException ex)
            {
                return Results.NotFound(new { mensaje = ex.Message });
            }
            catch (InvalidOperationException ex)
            {
                return Results.Conflict(new { mensaje = ex.Message });
            }
            catch (Exception)
            {
                return Results.Json(new { mensaje = "Error interno del servidor" }, statusCode: 500);
            }
        }

        private static async Task<IResult> ObtenerPorID(
            Guid FacturaID,
            HttpRequest httpRequest,
            IFacturacionService service)
        {
            try
            {
                var factura = await service.ObtenerPorIdAsync(FacturaID, httpRequest);

                if (factura is null)
                    return Results.NotFound(new { mensaje = $"No se encontró la factura '{FacturaID}'." });

                return Results.Ok(factura);
            }
            catch (UnauthorizedAccessException)
            {
                return Results.Unauthorized();
            }
            catch (Exception)
            {
                return Results.Json(new { mensaje = "Error interno del servidor" }, statusCode: 500);
            }
        }

        private static async Task<IResult> ObtenerPorPeriodo(
            Guid PeriodoID,
            HttpRequest httpRequest,
            IFacturacionService service)
        {
            try
            {
                var facturas = await service.ObtenerPorPeriodoAsync(PeriodoID, httpRequest);
                return Results.Ok(facturas);
            }
            catch (UnauthorizedAccessException)
            {
                return Results.Unauthorized();
            }
            catch (Exception)
            {
                return Results.Json(new { mensaje = "Error interno del servidor" }, statusCode: 500);
            }
        }
    }
}