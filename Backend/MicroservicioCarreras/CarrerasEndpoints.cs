using Microsoft.AspNetCore.Mvc;
using MicroservicioCarreras.Entities;
using MicroservicioCarreras.Services;

namespace MicroservicioCarreras
{
    public static class CarrerasEndpoints
    {
        public static void MapCarrerasEndpoints(this WebApplication app)
        {
            app.MapPost("/carrera", CrearAsync);
            app.MapPut("/carrera/{id}", ModificarAsync);
            app.MapDelete("/carrera/{id}", EliminarAsync);
            app.MapGet("/carrera", ObtenerTodosAsync);
            app.MapGet("/carrera/{id}", ObtenerPorIdAsync);
            app.MapGet("/carrera/institucion/{institucionId}", ObtenerPorInstitucionAsync);
        }

        private static async Task<IResult> CrearAsync(
            Carrera carrera,
            [FromHeader(Name = "Authorization")] string? authorization,
            [FromHeader(Name = "X-Usuario-Id")] string? usuarioId,
            ICarreraService service)
        {
            try
            {
                var creada = await service.CrearAsync(carrera, authorization, usuarioId);
                return Results.Created($"/carrera/{creada.CarreraCode}", creada);
            }
            catch (Exception ex)
            {
                return RespuestaError(ex, argumentoEsBadRequest: true);
            }
        }

        private static async Task<IResult> ModificarAsync(
            string id,
            CarreraUpdateRequest request,
            [FromHeader(Name = "Authorization")] string? authorization,
            [FromHeader(Name = "X-Usuario-Id")] string? usuarioId,
            ICarreraService service)
        {
            try
            {
                var actualizada = await service.ActualizarAsync(id, request, authorization, usuarioId);
                return Results.Ok(actualizada);
            }
            catch (Exception ex)
            {
                return RespuestaError(ex, argumentoEsBadRequest: true);
            }
        }

        private static async Task<IResult> EliminarAsync(
            string id,
            [FromHeader(Name = "Authorization")] string? authorization,
            [FromHeader(Name = "X-Usuario-Id")] string? usuarioId,
            ICarreraService service)
        {
            try
            {
                await service.EliminarAsync(id, authorization, usuarioId);
                return Results.NoContent();
            }
            catch (Exception ex)
            {
                return RespuestaError(ex);
            }
        }

        private static async Task<IResult> ObtenerTodosAsync(
            [FromHeader(Name = "Authorization")] string? authorization,
            [FromHeader(Name = "X-Usuario-Id")] string? usuarioId,
            int? pagina,
            ICarreraService service)
        {
            try
            {
                if (pagina.HasValue)
                    return Results.Ok(await service.ObtenerPaginadoAsync(pagina.Value, authorization, usuarioId));

                var carreras = await service.ObtenerTodosAsync(authorization, usuarioId);
                return Results.Ok(carreras);
            }
            catch (Exception ex)
            {
                return RespuestaError(ex, argumentoEsBadRequest: true);
            }
        }

        private static async Task<IResult> ObtenerPorIdAsync(
            string id,
            [FromHeader(Name = "Authorization")] string? authorization,
            [FromHeader(Name = "X-Usuario-Id")] string? usuarioId,
            ICarreraService service)
        {
            try
            {
                var carrera = await service.ObtenerPorIdAsync(id, authorization, usuarioId);
                return Results.Ok(carrera);
            }
            catch (Exception ex)
            {
                return RespuestaError(ex);
            }
        }

        private static async Task<IResult> ObtenerPorInstitucionAsync(
            string institucionId,
            [FromHeader(Name = "Authorization")] string? authorization,
            [FromHeader(Name = "X-Usuario-Id")] string? usuarioId,
            int? pagina,
            ICarreraService service)
        {
            try
            {
                if (pagina.HasValue)
                    return Results.Ok(await service.ObtenerPorInstitucionPaginadoAsync(institucionId, pagina.Value, authorization, usuarioId));

                var carreras = await service.ObtenerPorInstitucionAsync(institucionId, authorization, usuarioId);
                return Results.Ok(carreras);
            }
            catch (Exception ex)
            {
                return RespuestaError(ex, argumentoEsBadRequest: true);
            }
        }

        private static IResult RespuestaError(Exception ex, bool argumentoEsBadRequest = false) => ex switch
        {
            UnauthorizedAccessException => Results.Unauthorized(),
            UsuarioRequeridoException => Results.BadRequest(new { mensaje = ex.Message }),
            ArgumentException when argumentoEsBadRequest => Results.BadRequest(new { mensaje = ex.Message }),
            ConflictoException => Results.Conflict(new { mensaje = ex.Message }),
            KeyNotFoundException => Results.NotFound(new { mensaje = ex.Message }),
            _ => Results.Json(new { mensaje = "Error interno del servidor" }, statusCode: 500)
        };
    }
}
