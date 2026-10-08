using FluentValidation;
using MicroservicioPagos.Entities.DTOs;
using MicroservicioPagos.Services;
using MicroservicioPagos.Services.Clients;
using Microsoft.Data.SqlClient;

namespace MicroservicioPagos
{
    public static class PagosEndpoints
    {
        public static void MapPagosEndpoints(this WebApplication app)
        {
            var group = app.MapGroup("/pago");

            group.MapPost("", Crear);
            group.MapPatch("/{PagoID:guid}", Reversar);
            group.MapGet("/{PagoID:guid}", ObtenerPorID);
            group.MapGet("/periodo/{PeriodoID:guid}", ObtenerPorPeriodo);
        }

        private static async Task<IResult> Crear(
            PagoRequest request,
            HttpRequest httpRequest,
            IPagosService service,
            IValidator<PagoRequest> validator,
            IAuthServiceValidator authValidator,
            IBitacoraServiceClient bitacoraServiceClient)
        {
            var (usuario, token, error) = await authValidator.ValidarAsync(httpRequest);
            if (error is not null)
                return error;

            var validationResult = await validator.ValidateAsync(request);
            if (!validationResult.IsValid)
            {
                var errores = validationResult.Errors.Select(validation => new
                {
                    campo = validation.PropertyName,
                    mensaje = validation.ErrorMessage
                });
                return Results.BadRequest(new { errores });
            }

            try
            {
                var pago = await service.CrearAsync(request);
                try
                {
                    await bitacoraServiceClient.RegistrarBitacoraAsync(
                        usuario, $"Se registró el pago {pago.PagoID} de la factura {pago.FacturaID}.", token);
                }
                catch { }

                return Results.Created($"/pago/{pago.PagoID}", pago);
            }
            catch (SqlException exception)
            {
                if (exception.Number == 50000)
                {
                    var conflicto = exception.Message.Contains("pagada", StringComparison.OrdinalIgnoreCase)
                        || exception.Message.Contains("anulada", StringComparison.OrdinalIgnoreCase)
                        || exception.Message.Contains("pendiente", StringComparison.OrdinalIgnoreCase);
                    try
                    {
                        await bitacoraServiceClient.RegistrarBitacoraAsync(
                            usuario, $"Error al registrar el pago: {exception.Message}", token);
                    }
                    catch { }

                    if (exception.Message.Contains("No existe la factura", StringComparison.OrdinalIgnoreCase))
                        return Results.NotFound(new { mensaje = exception.Message });

                    return conflicto
                        ? Results.Conflict(new { mensaje = exception.Message })
                        : Results.BadRequest(new { mensaje = exception.Message });
                }

                try
                {
                    await bitacoraServiceClient.RegistrarBitacoraAsync(usuario, "Error técnico al registrar un pago.", token);
                }
                catch { }

                return Results.Json(new { mensaje = "Error interno del servidor" }, statusCode: 500);
            }
            catch (Exception)
            {
                try
                {
                    await bitacoraServiceClient.RegistrarBitacoraAsync(usuario, "Error técnico al registrar un pago.", token);
                }
                catch { }

                return Results.Json(new { mensaje = "Error interno del servidor" }, statusCode: 500);
            }
        }

        private static async Task<IResult> Reversar(
            Guid PagoID,
            HttpRequest httpRequest,
            IPagosService service,
            IAuthServiceValidator authValidator,
            IBitacoraServiceClient bitacoraServiceClient)
        {
            var (usuario, token, error) = await authValidator.ValidarAsync(httpRequest);
            if (error is not null)
                return error;

            try
            {
                var pago = await service.ReversarAsync(PagoID);
                try
                {
                    await bitacoraServiceClient.RegistrarBitacoraAsync(usuario, $"Se reversó el pago {PagoID}.", token);
                }
                catch { }

                return Results.Ok(pago);
            }
            catch (KeyNotFoundException exception)
            {
                try
                {
                    await bitacoraServiceClient.RegistrarBitacoraAsync(
                        usuario, $"Intento de reversar un pago inexistente {PagoID}.", token);
                }
                catch { }

                return Results.NotFound(new { mensaje = exception.Message });
            }
            catch (InvalidOperationException exception)
            {
                try
                {
                    await bitacoraServiceClient.RegistrarBitacoraAsync(
                        usuario, $"Error al reversar el pago {PagoID}: {exception.Message}", token);
                }
                catch { }

                return Results.Conflict(new { mensaje = exception.Message });
            }
            catch (SqlException)
            {
                try
                {
                    await bitacoraServiceClient.RegistrarBitacoraAsync(usuario, $"Error técnico al reversar el pago {PagoID}.", token);
                }
                catch { }

                return Results.Json(new { mensaje = "Error interno del servidor" }, statusCode: 500);
            }
            catch (Exception)
            {
                try
                {
                    await bitacoraServiceClient.RegistrarBitacoraAsync(usuario, $"Error técnico al reversar el pago {PagoID}.", token);
                }
                catch { }

                return Results.Json(new { mensaje = "Error interno del servidor" }, statusCode: 500);
            }
        }

        private static async Task<IResult> ObtenerPorID(
            Guid PagoID,
            HttpRequest httpRequest,
            IPagosService service,
            IAuthServiceValidator authValidator,
            IBitacoraServiceClient bitacoraServiceClient)
        {
            var (usuario, token, error) = await authValidator.ValidarAsync(httpRequest);
            if (error is not null)
                return error;

            try
            {
                var pago = await service.ObtenerPorIDAsync(PagoID);
                if (pago is null)
                    return Results.NotFound(new { mensaje = $"No se encontró el pago '{PagoID}'." });

                try
                {
                    await bitacoraServiceClient.RegistrarBitacoraAsync(usuario, $"Consulta del pago {PagoID}.", token);
                }
                catch { }

                return Results.Ok(pago);
            }
            catch (SqlException exception) when (exception.Number == 50000)
            {
                return Results.NotFound(new { mensaje = exception.Message });
            }
            catch (Exception)
            {
                try
                {
                    await bitacoraServiceClient.RegistrarBitacoraAsync(usuario, $"Error técnico al consultar el pago {PagoID}.", token);
                }
                catch { }

                return Results.Json(new { mensaje = "Error interno del servidor" }, statusCode: 500);
            }
        }

        private static async Task<IResult> ObtenerPorPeriodo(
            Guid PeriodoID,
            HttpRequest httpRequest,
            IPagosService service,
            IAuthServiceValidator authValidator,
            IBitacoraServiceClient bitacoraServiceClient)
        {
            var (usuario, token, error) = await authValidator.ValidarAsync(httpRequest);
            if (error is not null)
                return error;

            try
            {
                var pagos = await service.ObtenerPorPeriodoAsync(PeriodoID);
                try
                {
                    await bitacoraServiceClient.RegistrarBitacoraAsync(
                        usuario, $"Consulta de pagos del periodo {PeriodoID}.", token);
                }
                catch { }

                return Results.Ok(pagos);
            }
            catch (SqlException exception) when (exception.Number == 50000)
            {
                try
                {
                    await bitacoraServiceClient.RegistrarBitacoraAsync(
                        usuario, $"No se encontraron pagos para el periodo {PeriodoID}: {exception.Message}", token);
                }
                catch { }

                return Results.NotFound(new { mensaje = exception.Message });
            }
            catch (Exception)
            {
                try
                {
                    await bitacoraServiceClient.RegistrarBitacoraAsync(
                        usuario, $"Error técnico al consultar pagos del periodo {PeriodoID}.", token);
                }
                catch { }

                return Results.Json(new { mensaje = "Error interno del servidor" }, statusCode: 500);
            }
        }
    }
}
