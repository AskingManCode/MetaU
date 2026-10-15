using Microsoft.AspNetCore.Mvc;
using MicroservicioInstituciones.Entities;
using MicroservicioInstituciones.Services;

namespace MicroservicioInstituciones
{
    public static class InstitucionesEndpoints
    {
        public static void MapInstitucionesEndpoints(this WebApplication app)
        {
            app.MapPost("/institucion", CrearAsync);
            app.MapPut("/institucion/{id}", ModificarAsync);
            app.MapDelete("/institucion/{id}", EliminarAsync);
            app.MapGet("/institucion", ObtenerTodosAsync);
            app.MapGet("/institucion/{id}", ObtenerPorIdAsync);
        }

        private static async Task<IResult> CrearAsync(
            Institucion institucion,
            [FromHeader(Name = "Authorization")] string? authorization,
            [FromHeader(Name = "X-Usuario-Id")] string? usuarioId,
            IInstitucionService service)
        {
            try
            {
                var creada = await service.CrearAsync(institucion, authorization, usuarioId);
                return Results.Created($"/institucion/{creada.InstitucionCode}", creada);
            }
            catch (Exception ex)
            {
                return RespuestaError(ex, argumentoEsBadRequest: true);
            }
        }

        private static async Task<IResult> ModificarAsync(
            string id,
            InstitucionUpdateRequest request,
            [FromHeader(Name = "Authorization")] string? authorization,
            [FromHeader(Name = "X-Usuario-Id")] string? usuarioId,
            IInstitucionService service)
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
            IInstitucionService service)
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
            IInstitucionService service)
        {
            try
            {
                var instituciones = await service.ObtenerTodosAsync(authorization, usuarioId);
                return Results.Ok(instituciones);
            }
            catch (Exception ex)
            {
                return RespuestaError(ex);
            }
        }

        private static async Task<IResult> ObtenerPorIdAsync(
            string id,
            [FromHeader(Name = "Authorization")] string? authorization,
            [FromHeader(Name = "X-Usuario-Id")] string? usuarioId,
            IInstitucionService service)
        {
            try
            {
                var institucion = await service.ObtenerPorIdAsync(id, authorization, usuarioId);
                return Results.Ok(institucion);
            }
            catch (Exception ex)
            {
                return RespuestaError(ex);
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
