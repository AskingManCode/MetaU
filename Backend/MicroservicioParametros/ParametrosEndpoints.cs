using FluentValidation;
using MicroservicioParametros.Entities;
using MicroservicioParametros.Services;
using MicroservicioParametros.Services.Clients;
using Microsoft.Data.SqlClient;
using System.Text.Json;

namespace MicroservicioParametros
{
    public static class ParametrosEndpoints
    {
        public static void MapParametrosEndpoints(this WebApplication app)
        {
            var group = app.MapGroup("/api/parametro");

            group.MapPost("/", Crear);
            group.MapPatch("/{ParametroCode}", Modificar);
            group.MapDelete("/{ParametroCode}", Eliminar);
            group.MapGet("/{ParametroCode}", ObtenerPorID);
            group.MapGet("/", ObtenerTodos);

        }

        private static async Task<IResult> Crear(
            ParametroRequest request,
            HttpRequest httpRequest,
            IParametroService service,
            IValidator<ParametroRequest> validator,
            IAuthServiceValidator authValidator,
            IBitacoraServiceClient bitacora)
        {
            var (usuario, token, error) = await authValidator.ValidarAsync(httpRequest);

            if (error is not null)
                return error;

            var validationResult = await validator.ValidateAsync(request);

            if (!validationResult.IsValid)
            {
                var errores = validationResult.Errors
                    .Select(e => new
                    {
                        campo = e.PropertyName,
                        mensaje = e.ErrorMessage
                    });

                return Results.BadRequest(new { errores });
            }

            try
            {
                var parametroCreado = await service.CrearAsync(request);

                try
                {
                    await bitacora.RegistrarBitacoraAsync(
                        usuario,
                        $"Se creó el parámetro {parametroCreado.ParametroCode}: " + JsonSerializer.Serialize(parametroCreado),
                        token);
                }
                catch
                {
                    // No fallar la operación principal si la bitácora falla
                }

                return Results.Created($"/api/parametro/{parametroCreado.ParametroCode}", parametroCreado);
            }
            catch (SqlException)
            {
                try
                {
                    await bitacora.RegistrarBitacoraAsync(
                        usuario,
                        $"Error al crear parámetro {request.ParametroCode}: ya existe",
                        token);
                }
                catch { }

                return Results.Conflict(new
                {
                    mensaje = $"Ya existe un parámetro con el código '{request.ParametroCode}'."
                });
            }
            catch (Exception)
            {
                try
                {
                    await bitacora.RegistrarBitacoraAsync(
                        usuario,
                        $"Error técnico al crear parámetro {request.ParametroCode}",
                        token);
                }
                catch { }

                return Results.Json(
                    new { mensaje = "Error interno del servidor" },
                    statusCode: 500);
            }
        }

        private static async Task<IResult> Modificar(
            string ParametroCode,
            ParametroRequest request,
            HttpRequest httpRequest,
            IParametroService service,
            IValidator<ParametroRequest> validator,
            IAuthServiceValidator authValidator,
            IBitacoraServiceClient bitacora)
        {
            var (usuario, token, error) = await authValidator.ValidarAsync(httpRequest);

            if (error is not null)
                return error;
            
            request.ParametroCode = ParametroCode;

            var validationResult = await validator.ValidateAsync(request);

            if (!validationResult.IsValid)
            {
                var errores = validationResult.Errors
                    .Select(e => new
                    {
                        campo = e.PropertyName,
                        mensaje = e.ErrorMessage
                    });

                return Results.BadRequest(new { errores });
            }

            try
            {
                var parametroAnterior = await service.ObtenerPorIDAsync(request.ParametroCode);

                if (parametroAnterior is null)
                    return Results.NotFound(new { mensaje = $"No se encontró el parámetro con código '{ParametroCode}'." });

                var parametroModificado = await service.ModificarAsync(ParametroCode, request);

                if (parametroModificado is null)
                {
                    try
                    {
                        await bitacora.RegistrarBitacoraAsync(
                            usuario,
                            $"Intento de modificar parámetro inexistente: {ParametroCode}",
                            token);
                    }
                    catch { }

                    return Results.NotFound(new { mensaje = $"No se encontró el parámetro con código '{ParametroCode}'." });
                }

                try
                {
                    await bitacora.RegistrarBitacoraAsync(
                        usuario,
                        $"Se modificó el parámetro {ParametroCode}: Original: " 
                        + JsonSerializer.Serialize(parametroAnterior) 
                        + " Modificado: " + JsonSerializer.Serialize(parametroModificado),
                        token);
                }
                catch { }

                return Results.Ok(parametroModificado); // 200
            }
            catch (ArgumentException ex)
            {
                try
                {
                    await bitacora.RegistrarBitacoraAsync(
                        usuario,
                        $"Error al modificar parámetro {ParametroCode}: {ex.Message}",
                        token);
                }
                catch { }

                return Results.BadRequest(new { mensaje = ex.Message });
            }
            catch (Exception)
            {
                try
                {
                    await bitacora.RegistrarBitacoraAsync(
                        usuario,
                        $"Error técnico al modificar parámetro {ParametroCode}",
                        token);
                }
                catch { }

                return Results.Json(
                    new { mensaje = "Error interno del servidor" },
                    statusCode: 500);
            }
        }

        private static async Task<IResult> Eliminar(
            string ParametroCode,
            bool eliminacionFisica,
            HttpRequest httpRequest,
            IParametroService service,
            IAuthServiceValidator authValidator,
            IBitacoraServiceClient bitacora)
        {
            var (usuario, token, error) = await authValidator.ValidarAsync(httpRequest);

            if (error is not null)
                return error;

            try
            {
                var parametroEliminado = await service.EliminarAsync(ParametroCode, eliminacionFisica);

                if (parametroEliminado is null)
                {
                    try
                    {
                        await bitacora.RegistrarBitacoraAsync(
                            usuario,
                            $"Intento de eliminar parámetro inexistente: {ParametroCode}",
                            token);
                    }
                    catch { }

                    return Results.NotFound(new { mensaje = $"No se encontró el parámetro con código '{ParametroCode}'." });
                }

                var tipoEliminacion = eliminacionFisica ? "física" : "lógica";

                try
                {
                    await bitacora.RegistrarBitacoraAsync(
                        usuario,
                        $"Se eliminó ({tipoEliminacion}) el parámetro {ParametroCode}: {JsonSerializer.Serialize(parametroEliminado)}",
                        token);
                }
                catch { }

                return Results.Ok(parametroEliminado); // 200
            }
            catch (ArgumentException ex)
            {
                try
                {
                    await bitacora.RegistrarBitacoraAsync(
                        usuario,
                        $"Error al eliminar parámetro {ParametroCode}: {ex.Message}",
                        token);
                }
                catch { }

                return Results.BadRequest(new { mensaje = ex.Message });
            }
            catch (Exception)
            {
                try
                {
                    await bitacora.RegistrarBitacoraAsync(
                        usuario,
                        $"Error técnico al eliminar parámetro {ParametroCode}",
                        token);
                }
                catch { }

                return Results.Json(
                    new { mensaje = "Error interno del servidor" },
                    statusCode: 500);
            }
        }

        private static async Task<IResult> ObtenerPorID(
            string ParametroCode,
            HttpRequest httpRequest,
            IParametroService service,
            IAuthServiceValidator authValidator,
            IBitacoraServiceClient bitacora)
        {
            var (usuario, token, error) = await authValidator.ValidarAsync(httpRequest);

            if (error is not null)
                return error;

            try
            {
                var parametro = await service.ObtenerPorIDAsync(ParametroCode);

                if (parametro is null)
                    return Results.NotFound(new { mensaje = $"No se encontró el parámetro con código '{ParametroCode}'." });

                try
                {
                    await bitacora.RegistrarBitacoraAsync(usuario, $"Consulta parametro {ParametroCode}", token);
                }
                catch
                {
                }

                return Results.Ok(parametro); // 200
            }
            catch (ArgumentException ex)
            {
                try
                {
                    await bitacora.RegistrarBitacoraAsync(usuario, $"Error consulta parametro {ParametroCode}: {ex.Message}", token);
                }
                catch
                {
                }

                return Results.BadRequest(new { mensaje = ex.Message }); // 400
            }
            catch (Exception)
            {
                try
                {
                    await bitacora.RegistrarBitacoraAsync(usuario, $"Error tecnico al obtener parametro {ParametroCode}", token);
                }
                catch
                {
                }

                return Results.Json(
                    new { mensaje = "Error interno del servidor" },
                    statusCode: 500);
            }
        }

        private static async Task<IResult> ObtenerTodos(
            HttpRequest httpRequest,
            IParametroService service,
            IAuthServiceValidator authValidator,
            IBitacoraServiceClient bitacora)
        {
            var (usuario, token, error) = await authValidator.ValidarAsync(httpRequest);

            if (error is not null)
                return error;

            try
            {
                var parametros = await service.ObtenerTodosAsync();

                try
                {
                    await bitacora.RegistrarBitacoraAsync(
                        usuario,
                        $"Consulta de todos los parámetros.",
                        token);
                }
                catch { }

                return Results.Ok(parametros); // 200
            }
            catch (Exception)
            {
                try
                {
                    await bitacora.RegistrarBitacoraAsync(
                        usuario,
                        "Error técnico al consultar todos los parámetros",
                        token);
                }
                catch { }

                return Results.Json(
                    new { mensaje = "Error interno del servidor" },
                    statusCode: 500);
            }
        }
    }
}
