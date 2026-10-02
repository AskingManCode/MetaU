using FluentValidation;
using MicroservicioParametros.Entities;
using MicroservicioParametros.Services;
using MicroservicioParametros.Services.Clients;
using Microsoft.Data.SqlClient;

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
            IAuthServiceValidator authValidator/*,
            IBitacoraServiceClient bitacora*/)
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

                /*await bitacora.RegistrarAsync(
                    acceso.Usuario,
                    JsonSerializer.Serialize(creado),
                    acceso.Token);*/

                return Results.Created($"/parametro/{parametroCreado.ParametroCode}", parametroCreado); // 201

            }
            catch (SqlException)
            {
                //await RegistrarErrorAsync(bitacora, acceso.Usuario, acceso.Token);

                return Results.Conflict(new
                {
                    mensaje = $"Ya existe un parámetro con el código '{request.ParametroCode}'."
                });
            }
            catch (Exception)
            {
                //await RegistrarErrorAsync(bitacora, acceso.Usuario, acceso.Token);

                return Results.Json(
                    new { mensaje = "Error interno del servidor" },
                    statusCode: 500);
            }

        }
        public static async Task<IResult> Modificar()
        {
            throw new NotImplementedException();
        }

        public static async Task<IResult> Eliminar()
        {
            throw new NotImplementedException();
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

        public static async Task<IResult> ObtenerTodos()
        {
            throw new NotImplementedException();
        }
    }
}
