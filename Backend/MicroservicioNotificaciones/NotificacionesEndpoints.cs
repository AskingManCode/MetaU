namespace MicroservicioNotificaciones
{
    public static class NotificacionesEndpoints
    {
        public static void MapNotificacionesEndpoints(this WebApplication app)
        {
            var group = app.MapGroup("/api/notificar");

            group.MapPost("/", EnviarCorreo);
        }

        private static async Task<IResult> EnviarCorreo()
        {
            throw new NotImplementedException();
        }
    }
}
