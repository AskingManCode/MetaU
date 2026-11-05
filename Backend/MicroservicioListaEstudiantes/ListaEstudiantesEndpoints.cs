using MicroservicioListaEstudiantes.Services;
using MicroservicioListaEstudiantes.Services.Clients;
using Microsoft.AspNetCore.Mvc;

namespace MicroservicioListaEstudiantes
{
    public static class ListadoEstudiantesEndpoints
    {
        public static void MapListadoEstudiantesEndpoints(this IEndpointRouteBuilder routes)
        {
            var group = routes.MapGroup("/listadoestudiantes").RequireCors("ClientApps");

            string ObtenerToken(HttpRequest request) =>
                request.Headers.Authorization.ToString().Replace("Bearer ", "");

            async Task<bool> TokenValidoAsync(HttpRequest request, IAuthServiceClient authService)
                => await authService.ValidarAsync(ObtenerToken(request));

            bool ObtenerUsuarioId(HttpRequest request, out Guid usuarioId)
                => Guid.TryParse(request.Headers["X-Usuario-Id"], out usuarioId) && usuarioId != Guid.Empty;

            async Task<IResult> EjecutarAsync(Func<Task<IResult>> accion)
            {
                try
                {
                    return await accion();
                }
                catch (ArgumentException ex)
                {
                    return Results.BadRequest(new { message = ex.Message });
                }
                catch (KeyNotFoundException ex)
                {
                    return Results.NotFound(new { message = ex.Message });
                }
                catch (InvalidOperationException ex)
                {
                    return Results.Conflict(new { message = ex.Message });
                }
            }

            group.MapGet("/", async (
                HttpRequest request,
                string? periodo,
                [FromServices] IListadoEstudiantesService service,
                [FromServices] IAuthServiceClient authService,
                [FromServices] IBitacoraServiceClient bitacoraService) =>
            {
                if (!await TokenValidoAsync(request, authService))
                    return Results.Unauthorized();

                if (!ObtenerUsuarioId(request, out var usuarioId))
                    return Results.BadRequest(new { message = "El usuario es requerido" });

                return await EjecutarAsync(async () =>
                {
                    var listado = await service.ObtenerPorPeriodoAsync(periodo, usuarioId, ObtenerToken(request));

                    await bitacoraService.RegistrarAsync(usuarioId, $"El usuario consulta listado de estudiantes del periodo {periodo}", ObtenerToken(request));

                    return Results.Ok(listado);
                });
            })
            .WithName("GetListadoEstudiantes")
            .WithOpenApi();
        }
    }
}