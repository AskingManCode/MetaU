using MicroservicioDirecciones.Services;
using MicroservicioDirecciones.Services.Clients;
using Microsoft.Data.SqlClient;

namespace MicroservicioDirecciones
{
    public static class DireccionesEndpoints
    {
        public static void MapDireccionesEndpoints(this WebApplication app)
        {
            var group = app.MapGroup("/api");

            group.MapGet("/provincias", ObtenerProvincias);
            group.MapGet("/cantones/{ProvinciaID}", ObtenerCantones);
            group.MapGet("/distritos/{ProvinciaID}/{CantonID}", ObtenerDistritos);
        
        }

        private static async Task<IResult> ObtenerProvincias(
            HttpRequest httpRequest,
            IDireccionService service,
            IAuthServiceValidator authServiceValidator,
            IBitacoraServiceClient bitacoraServiceClient)
        {
            var (usuario, token, error) = await authServiceValidator.ValidarAsync(httpRequest);

            if (error is not null)
                return error;

            try
            {
                var provincias = await service.ObtenerProvinciasAsync();

                try
                {
                    await bitacoraServiceClient.RegistrarBitacoraAsync(
                        usuario,
                        "Consulta todas las provincias",
                        token);
                }
                catch { }

                return Results.Ok(provincias); // 200
            }
            catch (Exception)
            {
                try
                {
                    await bitacoraServiceClient.RegistrarBitacoraAsync(
                        usuario,
                        "Error técnico al consultar todas las provincias",
                        token);
                }
                catch { }

                return Results.Json(
                    new { mensaje = "Error interno del servidor" },
                    statusCode: 500);
            }
        }

        private static async Task<IResult> ObtenerCantones(
            string ProvinciaID,
            HttpRequest httpRequest,
            IDireccionService service,
            IAuthServiceValidator authServiceValidator,
            IBitacoraServiceClient bitacoraServiceClient)
        {
            var (usuario, token, error) = await authServiceValidator.ValidarAsync(httpRequest);

            if (error is not null)
                return error;

            if (!Guid.TryParse(ProvinciaID, out var provinciaGuid))
            {
                try
                {
                    await bitacoraServiceClient.RegistrarBitacoraAsync(
                        usuario,
                        $"Intento de consulta de cantones con ProvinciaID inválido: {ProvinciaID}",
                        token);
                }
                catch { }

                return Results.BadRequest(new { mensaje = "El identificador de la provincia no es válido." });
            }
            try
            {
                var cantones = await service.ObtenerCantonesAsync(provinciaGuid);

                try
                {
                    await bitacoraServiceClient.RegistrarBitacoraAsync(
                        usuario,
                        $"Consulta cantones de la provincia {ProvinciaID}",
                        token);
                }
                catch { }

                return Results.Ok(cantones);
            }
            catch (SqlException ex)
            {
                if (ex.Number == 50000)
                {
                    try
                    {
                        await bitacoraServiceClient.RegistrarBitacoraAsync(
                            usuario,
                            $"Error al consultar cantones de la provincia {ProvinciaID}: {ex.Message}",
                            token);
                    }
                    catch { }

                    if (ex.Message.Contains("No se encontró"))
                        return Results.NotFound(new { mensaje = ex.Message });

                    return Results.BadRequest(new { mensaje = ex.Message });
                }

                try
                {
                    await bitacoraServiceClient.RegistrarBitacoraAsync(
                        usuario,
                        $"Error técnico al consultar cantones de la provincia {ProvinciaID}: {ex.Message}",
                        token);
                }
                catch { }

                return Results.Json(new { mensaje = "Error interno del servidor" }, statusCode: 500);
            }
            catch (ArgumentException ex)
            {
                try
                {
                    await bitacoraServiceClient.RegistrarBitacoraAsync(
                        usuario,
                        $"Error al consultar cantones: {ex.Message}",
                        token);
                }
                catch { }

                return Results.BadRequest(new { mensaje = ex.Message });
            }
            catch (Exception)
            {
                try
                {
                    await bitacoraServiceClient.RegistrarBitacoraAsync(
                        usuario,
                        $"Error técnico al consultar cantones de la provincia {ProvinciaID}",
                        token);
                }
                catch { }

                return Results.Json(new { mensaje = "Error interno del servidor" }, statusCode: 500);
            }
        }

        private static async Task<IResult> ObtenerDistritos(
            string ProvinciaID,
            string CantonID,
            HttpRequest httpRequest,
            IDireccionService service,
            IAuthServiceValidator authServiceValidator,
            IBitacoraServiceClient bitacoraServiceClient)
        {
            var (usuario, token, error) = await authServiceValidator.ValidarAsync(httpRequest);

            if (error is not null)
                return error;

            if (!Guid.TryParse(ProvinciaID, out var provinciaGuid))
            {
                try
                {
                    await bitacoraServiceClient.RegistrarBitacoraAsync(
                        usuario,
                        $"Intento de consulta de distritos con ProvinciaID inválido: {ProvinciaID}",
                        token);
                }
                catch { }

                return Results.BadRequest(new { mensaje = "El identificador de la provincia no es válido." });
            }

            if (!Guid.TryParse(CantonID, out var cantonGuid))
            {
                try
                {
                    await bitacoraServiceClient.RegistrarBitacoraAsync(
                        usuario,
                        $"Intento de consulta de distritos con CantonID inválido: {CantonID}",
                        token);
                }
                catch { }

                return Results.BadRequest(new { mensaje = "El identificador del cantón no es válido." });
            }
            try
            {
                var distritos = await service.ObtenerDistritosAsync(provinciaGuid, cantonGuid);

                try
                {
                    await bitacoraServiceClient.RegistrarBitacoraAsync(
                        usuario,
                        $"Consulta distritos de la provincia {ProvinciaID} y cantón {CantonID}",
                        token);
                }
                catch { }

                return Results.Ok(distritos);
            }
            catch (SqlException ex)
            {
                if (ex.Number == 50000)
                {
                    try
                    {
                        await bitacoraServiceClient.RegistrarBitacoraAsync(
                            usuario,
                            $"Error al consultar distritos (Provincia: {ProvinciaID}, Cantón: {CantonID}): {ex.Message}",
                            token);
                    }
                    catch { }

                    if (ex.Message.Contains("No se encontró"))
                        return Results.NotFound(new { mensaje = ex.Message });

                    return Results.BadRequest(new { mensaje = ex.Message });
                }

                try
                {
                    await bitacoraServiceClient.RegistrarBitacoraAsync(
                        usuario,
                        $"Error técnico al consultar distritos (Provincia: {ProvinciaID}, Cantón: {CantonID}): {ex.Message}",
                        token);
                }
                catch { }

                return Results.Json(new { mensaje = "Error interno del servidor" }, statusCode: 500);
            }
            catch (ArgumentException ex)
            {
                try
                {
                    await bitacoraServiceClient.RegistrarBitacoraAsync(
                        usuario,
                        $"Error al consultar distritos: {ex.Message}",
                        token);
                }
                catch { }

                return Results.BadRequest(new { mensaje = ex.Message });
            }
            catch (Exception)
            {
                try
                {
                    await bitacoraServiceClient.RegistrarBitacoraAsync(
                        usuario,
                        $"Error técnico al consultar distritos (Provincia: {ProvinciaID}, Cantón: {CantonID})",
                        token);
                }
                catch { }

                return Results.Json(new { mensaje = "Error interno del servidor" }, statusCode: 500);
            }
        }
    }
}
