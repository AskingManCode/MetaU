using FluentValidation;
using MicroservicioParametros.Entities;
using MicroservicioParametros.Services;
using Microsoft.Data.SqlClient;

namespace MicroservicioParametros
{
    public static class ParametrosEndpoints
    {
        public static void MapParametrosEndpoints(this WebApplication app)
        {
            app.MapPost("/parametro", Crear);
            app.MapPatch("/parametro/{ParametroCode}", Modificar);
            app.MapDelete("/parametro/{ParametroCode}", Eliminar);
            app.MapGet("/parametro/{ParametroCode}", ObtenerPorID);
            app.MapGet("/parametro", ObtenerTodos);

        }

        private static async Task<IResult> Crear(
            ParametroRequest request,
            HttpRequest httpRequest,
            IParametroService service,
            IValidator<ParametroRequest> validator/*,
            IAuthServiceClient auth,
            IBitacoraServiceClient bitacora*/)
        {
            /*var acceso = await ValidarAccesoAsync(httpRequest, auth);

            if (acceso.Error != null)
                return acceso.Error;*/

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
            catch (SqlException ex)
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
            IParametroService service,
            IAuthServiceClient auth/*,
            IBitacoraServiceClient bitacora*/)
        {
            /*var acceso = await ValidarAccesoAsync(httpRequest, auth);

            if (acceso.Error != null)
                return acceso.Error;*/

            try
            {
                var parametro = await service.ObtenerPorIDAsync(ParametroCode);

                if (parametro is null)
                    return Results.NotFound(new { mensaje = $"No se encontró el parámetro con código '{ParametroCode}'." });

                /*await bitacora.RegistrarAsync(
                    acceso.Usuario,
                    "El usuario consulta periodo",
                    acceso.Token);*/

                return Results.Ok(parametro); // 200
            }
            catch (ArgumentException ex)
            {
                // await RegistrarErrorAsync(bitacora, acceso.Usuario, acceso.Token);

                return Results.BadRequest(new { mensaje = ex.Message }); // 400
            }
            catch (Exception)
            {
                // await RegistrarErrorAsync(bitacora, acceso.Usuario, acceso.Token);

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
