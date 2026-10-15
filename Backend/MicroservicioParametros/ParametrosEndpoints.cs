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
            IParametroService service)
        {
            try
            {
                var parametroCreado = await service.CrearAsync(request, httpRequest);
                return Results.Created($"/api/parametro/{parametroCreado.ParametroCode}", parametroCreado);
            }
            catch (UnauthorizedAccessException ex)
            {
                return Results.Json(new { mensaje = ex.Message }, statusCode: 401);
            }
            catch (ValidationException ex)
            {
                var errores = ex.Errors.Select(e => new { campo = e.PropertyName, mensaje = e.ErrorMessage });
                return Results.BadRequest(new { errores });
            }
            catch (SqlException ex)
            {
                if (ex.Number == 50000)
                {
                    if (ex.Message.Contains("Ya existe un parámetro"))
                        return Results.Conflict(new { mensaje = ex.Message });

                    return Results.BadRequest(new { mensaje = ex.Message });
                }

                return Results.Json(new { mensaje = "Error interno del servidor" }, statusCode: 500);
            }
            catch (Exception)
            {
                return Results.Json(new { mensaje = "Error interno del servidor" }, statusCode: 500);
            }
        }

        private static async Task<IResult> Modificar(
            string ParametroCode,
            ParametroRequest request,
            HttpRequest httpRequest,
            IParametroService service)
        {
            try
            {
                var parametroModificado = await service.ModificarAsync(ParametroCode, request, httpRequest);
                return Results.Ok(parametroModificado);
            }
            catch (UnauthorizedAccessException ex)
            {
                return Results.Json(new { mensaje = ex.Message }, statusCode: 401);
            }
            catch (ValidationException ex)
            {
                var errores = ex.Errors.Select(e => new { campo = e.PropertyName, mensaje = e.ErrorMessage });
                return Results.BadRequest(new { errores });
            }
            catch (KeyNotFoundException ex)
            {
                return Results.NotFound(new { mensaje = ex.Message });
            }
            catch (SqlException ex)
            {
                if (ex.Number == 50000)
                    return Results.BadRequest(new { mensaje = ex.Message });

                return Results.Json(new { mensaje = "Error interno del servidor" }, statusCode: 500);
            }
            catch (ArgumentException ex)
            {
                return Results.BadRequest(new { mensaje = ex.Message });
            }
            catch (Exception)
            {
                return Results.Json(new { mensaje = "Error interno del servidor" }, statusCode: 500);
            }
        }

        private static async Task<IResult> Eliminar(
            string ParametroCode,
            bool eliminacionFisica,
            HttpRequest httpRequest,
            IParametroService service)
        {
            try
            {
                var parametroEliminado = await service.EliminarAsync(ParametroCode, eliminacionFisica, httpRequest);
                return Results.Ok(parametroEliminado);
            }
            catch (UnauthorizedAccessException ex)
            {
                return Results.Json(new { mensaje = ex.Message }, statusCode: 401);
            }
            catch (KeyNotFoundException ex)
            {
                return Results.NotFound(new { mensaje = ex.Message });
            }
            catch (SqlException ex)
            {
                if (ex.Number == 50000)
                    return Results.BadRequest(new { mensaje = ex.Message });

                return Results.Json(new { mensaje = "Error interno del servidor" }, statusCode: 500);
            }
            catch (ArgumentException ex)
            {
                return Results.BadRequest(new { mensaje = ex.Message });
            }
            catch (Exception)
            {
                return Results.Json(new { mensaje = "Error interno del servidor" }, statusCode: 500);
            }
        }

        private static async Task<IResult> ObtenerPorID(
            string ParametroCode,
            HttpRequest httpRequest,
            IParametroService service)
        {
            try
            {
                var parametro = await service.ObtenerPorIDAsync(ParametroCode, httpRequest);
                return Results.Ok(parametro);
            }
            catch (UnauthorizedAccessException ex)
            {
                return Results.Json(new { mensaje = ex.Message }, statusCode: 401);
            }
            catch (KeyNotFoundException ex)
            {
                return Results.NotFound(new { mensaje = ex.Message });
            }
            catch (ArgumentException ex)
            {
                return Results.BadRequest(new { mensaje = ex.Message });
            }
            catch (Exception)
            {
                return Results.Json(new { mensaje = "Error interno del servidor" }, statusCode: 500);
            }
        }

        private static async Task<IResult> ObtenerTodos(
            HttpRequest httpRequest,
            IParametroService service)
        {
            try
            {
                var parametros = await service.ObtenerTodosAsync(httpRequest);
                return Results.Ok(parametros);
            }
            catch (UnauthorizedAccessException ex)
            {
                return Results.Json(new { mensaje = ex.Message }, statusCode: 401);
            }
            catch (Exception)
            {
                return Results.Json(new { mensaje = "Error interno del servidor" }, statusCode: 500);
            }
        }
    }
}
