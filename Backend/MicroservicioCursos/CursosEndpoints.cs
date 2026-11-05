using MicroservicioCursos.Entities;
using MicroservicioCursos.Services;
using Microsoft.AspNetCore.Mvc;

namespace MicroservicioCursos
{
    public static class CursosEndpoints
    {
        public static void MapCursosEndpoints(this WebApplication app)
        {
            app.MapPost("/curso", CrearAsync);
            app.MapPut("/curso/{cursoCode}", ModificarAsync);
            app.MapDelete("/curso/{cursoCode}", EliminarAsync);
            app.MapGet("/curso", ObtenerTodosAsync);
            app.MapGet("/curso/{cursoCode}", ObtenerPorIdAsync);
            app.MapGet("/curso/carrera/{carreraCode}", ObtenerPorCarreraAsync);
        }

        private static async Task<IResult> CrearAsync(
            CursoRequest request,
            [FromHeader(Name = "Authorization")] string? authorization,
            [FromHeader(Name = "X-Usuario-Id")] string? usuarioId,
            ICursoService service)
        {
            try
            {
                var curso = await service.CrearAsync(request, authorization, usuarioId);
                return Results.Created(
                    $"/curso/{curso.CursoCode}",
                    curso);
            }
            catch (Exception ex)
            {
                return RespuestaError(ex, argumentoEsBadRequest: true);
            }
        }

        private static async Task<IResult> ModificarAsync(
            string cursoCode,
            CursoRequest request,
            [FromHeader(Name = "Authorization")] string? authorization,
            [FromHeader(Name = "X-Usuario-Id")] string? usuarioId,
            ICursoService service)
        {
            try
            {
                var curso = await service.ModificarAsync(cursoCode, request, authorization, usuarioId);
                return Results.Ok(curso);
            }
            catch (Exception ex)
            {
                return RespuestaError(ex, argumentoEsBadRequest: true);
            }
        }

        private static async Task<IResult> EliminarAsync(
            string cursoCode,
            [FromHeader(Name = "Authorization")] string? authorization,
            [FromHeader(Name = "X-Usuario-Id")] string? usuarioId,
            ICursoService service)
        {
            try
            {
                var curso = await service.EliminarAsync(cursoCode, authorization, usuarioId);
                return Results.Ok(curso);
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
            ICursoService service)
        {
            try
            {
                if (pagina.HasValue)
                    return Results.Ok(await service.ObtenerPaginadoAsync(pagina.Value, authorization, usuarioId));

                var cursos = await service.ObtenerTodosAsync(authorization, usuarioId);
                return Results.Ok(cursos);
            }
            catch (Exception ex)
            {
                return RespuestaError(ex, argumentoEsBadRequest: true);
            }
        }

        private static async Task<IResult> ObtenerPorIdAsync(
            string cursoCode,
            [FromHeader(Name = "Authorization")] string? authorization,
            [FromHeader(Name = "X-Usuario-Id")] string? usuarioId,
            ICursoService service)
        {
            try
            {
                var curso = await service.ObtenerPorIdAsync(cursoCode, authorization, usuarioId);
                return Results.Ok(curso);
            }
            catch (Exception ex)
            {
                return RespuestaError(ex);
            }
        }

        private static async Task<IResult> ObtenerPorCarreraAsync(
            string carreraCode,
            [FromHeader(Name = "Authorization")] string? authorization,
            [FromHeader(Name = "X-Usuario-Id")] string? usuarioId,
            int? pagina,
            ICursoService service)
        {
            try
            {
                if (pagina.HasValue)
                    return Results.Ok(await service.ObtenerPorCarreraPaginadoAsync(carreraCode, pagina.Value, authorization, usuarioId));

                var cursos = await service.ObtenerPorCarreraAsync(carreraCode, authorization, usuarioId);
                return Results.Ok(cursos);
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