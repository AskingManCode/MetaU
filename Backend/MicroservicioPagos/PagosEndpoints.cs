using MicroservicioPagos.Entities;
using MicroservicioPagos.Services;
using Microsoft.Data.SqlClient;

namespace MicroservicioPagos
{
    public static class PagosEndpoints
    {
        public static void MapPagosEndpoints(this WebApplication app)
        {
            var group = app.MapGroup("/pago");

            group.MapPost("/{FacturaID}", Crear);
            group.MapPatch("/{PagoID}", Reversar);
            group.MapGet("/{PagoID}", ObtenerPorID);
            group.MapGet("/periodo/{PeriodoID}", ObtenerPorPeriodo);
        }

        private static async Task<IResult> Crear(
            Guid facturaId,
            HttpRequest httpRequest,
            IPagosService service)
        {
            try
            {
                var pago = await service.CrearAsync(facturaId, httpRequest);
                return Results.Created($"/pago/{pago.PagoID}", pago);
            }
            catch (UnauthorizedAccessException ex)
            {
                return Results.Json(new { mensaje = ex.Message }, statusCode: 401);
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
            catch (SqlException ex)
            {
                if (ex.Message.Contains("No existe la factura", StringComparison.OrdinalIgnoreCase))
                    return Results.NotFound(new { mensaje = ex.Message });

                var esConflicto = ex.Message.Contains("pagada", StringComparison.OrdinalIgnoreCase)
                    || ex.Message.Contains("anulada", StringComparison.OrdinalIgnoreCase)
                    || ex.Message.Contains("pendiente", StringComparison.OrdinalIgnoreCase)
                    || ex.Message.Contains("saldo", StringComparison.OrdinalIgnoreCase);

                return esConflicto
                    ? Results.Conflict(new { mensaje = ex.Message })
                    : Results.BadRequest(new { mensaje = ex.Message });
            }
            catch (Exception ex)
            {
                return Results.Json(new
                {
                    mensaje = "Error interno del servidor",
                    detalle = ex.Message,
                    tipo = ex.GetType().Name
                }, statusCode: 500);
            }
        }

        private static async Task<IResult> Reversar(
            Guid PagoID,
            HttpRequest httpRequest,
            IPagosService service)
        {
            try
            {
                var pago = await service.ReversarAsync(PagoID, httpRequest);
                return Results.Ok(pago);
            }
            catch (UnauthorizedAccessException ex)
            {
                return Results.Json(new { mensaje = ex.Message }, statusCode: 401);
            }
            catch (KeyNotFoundException ex)
            {
                return Results.NotFound(new { mensaje = ex.Message });
            }
            catch (InvalidOperationException ex)
            {
                return Results.Conflict(new { mensaje = ex.Message });
            }
            catch (SqlException ex)
            {
                return Results.BadRequest(new { mensaje = ex.Message });
            }
            catch (Exception ex)
            {
                return Results.Json(new
                {
                    mensaje = "Error interno del servidor",
                    detalle = ex.Message,
                    tipo = ex.GetType().Name
                }, statusCode: 500);
            }
        }

        private static async Task<IResult> ObtenerPorID(
            Guid PagoID,
            HttpRequest httpRequest,
            IPagosService service)
        {
            try
            {
                var pago = await service.ObtenerPorIdAsync(PagoID, httpRequest);

                if (pago is null)
                    return Results.NotFound(new { mensaje = $"No se encontró el pago '{PagoID}'." });

                return Results.Ok(pago);
            }
            catch (UnauthorizedAccessException ex)
            {
                return Results.Json(new { mensaje = ex.Message }, statusCode: 401);
            }
            catch (Exception ex)
            {
                return Results.Json(new
                {
                    mensaje = "Error interno del servidor",
                    detalle = ex.Message,
                    tipo = ex.GetType().Name
                }, statusCode: 500);
            }
        }

        private static async Task<IResult> ObtenerPorPeriodo(
            Guid PeriodoID,
            HttpRequest httpRequest,
            IPagosService service)
        {
            try
            {
                var pagos = await service.ObtenerPorPeriodoAsync(PeriodoID, httpRequest);
                return Results.Ok(pagos);
            }
            catch (UnauthorizedAccessException ex)
            {
                return Results.Json(new { mensaje = ex.Message }, statusCode: 401);
            }
            catch (Exception ex)
            {
                return Results.Json(new
                {
                    mensaje = "Error interno del servidor",
                    detalle = ex.Message,
                    tipo = ex.GetType().Name
                }, statusCode: 500);
            }
        }
    }
}
