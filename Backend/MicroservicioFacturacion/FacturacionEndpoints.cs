using FluentValidation;
using MicroservicioFacturacion.Entities;
using MicroservicioFacturacion.Services;
using MicroservicioFacturacion.Services.Clients;
using Microsoft.Data.SqlClient;

namespace MicroservicioFacturacion
{
    public static class FacturacionEndpoints
    {
        public static void MapFacturacionEndpoints(this WebApplication app)
        {
            var group = app.MapGroup("/api/factura");

            group.MapPost("/", Crear);
            group.MapPatch("/{FacturaID:guid}", Anular);
            group.MapGet("/{FacturaID:guid}", ObtenerPorID);
            group.MapGet("/periodo/{PeriodoID:guid}", ObtenerPorPeriodo);
        }

        private static async Task<IResult> Crear(
            FacturacionRequest request,
            HttpRequest httpRequest,
            IFacturacionService service,
            IValidator<FacturacionRequest> validator,
            IAuthServiceValidator authValidator,
            IBitacoraServiceClient bitacoraServiceClient)
        {
            var (usuario, token, error) = await authValidator.ValidarAsync(httpRequest);

            if (error is not null)
                return error;

            var validationResult = await validator.ValidateAsync(request);

            if (!validationResult.IsValid)
            {
                var errores = validationResult.Errors
                    .Select(validation => new
                    {
                        campo = validation.PropertyName,
                        mensaje = validation.ErrorMessage
                    });

                return Results.BadRequest(new { errores });
            }

            try
            {
                var factura = await service.CrearAsync(request, usuario, token);

                try
                {
                    await bitacoraServiceClient.RegistrarBitacoraAsync(
                        usuario,
                        $"Se creó la factura {factura.FacturaID}: {System.Text.Json.JsonSerializer.Serialize(factura)}",
                        token);
                }
                catch
                {
                }

                return Results.Created($"/api/factura/{factura.FacturaID}", factura);
            }
            catch (SqlException exception)
            {
                if (exception.Number == 50000)
                {
                    try
                    {
                        await bitacoraServiceClient.RegistrarBitacoraAsync(
                            usuario, $"Error al crear factura: {exception.Message}", token);
                    }
                    catch { }

                    return Results.BadRequest(new { mensaje = exception.Message });
                }

                try
                {
                    await bitacoraServiceClient.RegistrarBitacoraAsync(
                        usuario, "Error técnico al crear factura.", token);
                }
                catch { }

                return Results.Json(new { mensaje = "Error interno del servidor" }, statusCode: 500);
            }
            catch (KeyNotFoundException exception)
            {
                try
                {
                    await bitacoraServiceClient.RegistrarBitacoraAsync(
                        usuario, $"No se encontró la matrícula para crear la factura: {exception.Message}", token);
                }
                catch { }

                return Results.NotFound(new { mensaje = exception.Message });
            }
            catch (InvalidOperationException exception)
            {
                try
                {
                    await bitacoraServiceClient.RegistrarBitacoraAsync(
                        usuario, $"Conflicto al crear factura: {exception.Message}", token);
                }
                catch { }

                return Results.Conflict(new { mensaje = exception.Message });
            }
            catch (Exception)
            {
                try
                {
                    await bitacoraServiceClient.RegistrarBitacoraAsync(
                        usuario, "Error técnico al crear factura.", token);
                }
                catch { }

                return Results.Json(new { mensaje = "Error interno del servidor" }, statusCode: 500);
            }
        }

        private static async Task<IResult> Anular(
            Guid FacturaID,
            HttpRequest httpRequest,
            IFacturacionService service,
            IAuthServiceValidator authValidator,
            IBitacoraServiceClient bitacoraServiceClient)
        {
            var (usuario, token, error) = await authValidator.ValidarAsync(httpRequest);

            if (error is not null)
                return error;

            try
            {
                var factura = await service.AnularAsync(FacturaID);

                try
                {
                    await bitacoraServiceClient.RegistrarBitacoraAsync(
                        usuario, $"Se anuló la factura {FacturaID}.", token);
                }
                catch { }

                return Results.Ok(factura);
            }
            catch (KeyNotFoundException exception)
            {
                try
                {
                    await bitacoraServiceClient.RegistrarBitacoraAsync(
                        usuario, $"Intento de anular factura inexistente {FacturaID}.", token);
                }
                catch { }

                // return Results.NotFound(new { mensaje = exception.Message });

                return Results.Problem(
                    statusCode: 500,
                    detail: exception.ToString());
            }
            catch (InvalidOperationException exception)
            {
                try
                {
                    await bitacoraServiceClient.RegistrarBitacoraAsync(
                        usuario, $"Error al anular factura {FacturaID}: {exception.Message}", token);
                }
                catch { }

                // return Results.Conflict(new { mensaje = exception.Message });

                return Results.Problem(
                    statusCode: 500,
                    detail: exception.ToString());
            }
            catch (SqlException ex)
            {
                try
                {
                    await bitacoraServiceClient.RegistrarBitacoraAsync(
                        usuario, $"Error técnico al anular factura {FacturaID}.", token);
                }
                catch { }

                // return Results.Json(new { mensaje = "Error interno del servidor" }, statusCode: 500);

                return Results.Problem(
                    statusCode: 500,
                    detail: ex.ToString());
            }
            catch (Exception ex)
            {
                try
                {
                    await bitacoraServiceClient.RegistrarBitacoraAsync(
                        usuario, $"Error técnico al anular factura {FacturaID}.", token);
                }
                catch { }

                // return Results.Json(new { mensaje = "Error interno del servidor" }, statusCode: 500);

                return Results.Problem(
                    statusCode: 500,
                    detail: ex.ToString());
            }
        }

        private static async Task<IResult> ObtenerPorID(
            Guid FacturaID,
            HttpRequest httpRequest,
            IFacturacionService service,
            IAuthServiceValidator authValidator,
            IBitacoraServiceClient bitacoraServiceClient)
        {
            var (usuario, token, error) = await authValidator.ValidarAsync(httpRequest);

            if (error is not null)
                return error;

            try
            {
                var factura = await service.ObtenerPorIdAsync(FacturaID);

                if (factura is null)
                    return Results.NotFound(new { mensaje = $"No se encontró la factura '{FacturaID}'." });

                try
                {
                    await bitacoraServiceClient.RegistrarBitacoraAsync(
                        usuario, $"Consulta de factura {FacturaID}.", token);
                }
                catch { }

                return Results.Ok(factura);
            }
            catch (Exception)
            {
                try
                {
                    await bitacoraServiceClient.RegistrarBitacoraAsync(
                        usuario, $"Error técnico al obtener factura {FacturaID}.", token);
                }
                catch { }

                return Results.Json(new { mensaje = "Error interno del servidor" }, statusCode: 500);
            }
        }

        private static async Task<IResult> ObtenerPorPeriodo(
            Guid PeriodoID,
            HttpRequest httpRequest,
            IFacturacionService service,
            IAuthServiceValidator authValidator,
            IBitacoraServiceClient bitacoraServiceClient)
        {
            var (usuario, token, error) = await authValidator.ValidarAsync(httpRequest);

            if (error is not null)
                return error;

            try
            {
                var facturas = await service.ObtenerPorPeriodoAsync(PeriodoID);

                try
                {
                    await bitacoraServiceClient.RegistrarBitacoraAsync(
                        usuario, $"Consulta de facturación del periodo {PeriodoID}.", token);
                }
                catch { }

                return Results.Ok(facturas);
            }
            catch (Exception)
            {
                try
                {
                    await bitacoraServiceClient.RegistrarBitacoraAsync(
                        usuario, $"Error técnico al consultar facturación del periodo {PeriodoID}.", token);
                }
                catch { }

                return Results.Json(new { mensaje = "Error interno del servidor" }, statusCode: 500);
            }
        }
    }
}
