namespace MicroservicioFacturacion
{
    public static class FacturacionEndpoints
    {
        public static void MapFacturacionEndpoints(this WebApplication app)
        {
            var group = app.MapGroup("/api/factura");

            group.MapPost("/", Crear);
            group.MapPatch("/{FacturaID}", Anular);
            group.MapGet("/{FacturaID}", ObtenerPorID);
            group.MapGet("/{FechaInicio}/{FechaFin}", ObtenerPorPEriodo);
        }

        private static async Task<IResult> Crear()
        {
            throw new NotImplementedException();
        }

        private static async Task<IResult> Anular()
        {
            throw new NotImplementedException();
        }
        
        private static async Task<IResult> ObtenerPorID()
        {
            throw new NotImplementedException();
        }

        private static async Task<IResult> ObtenerPorPEriodo()
        {
            throw new NotImplementedException();
        }
    }
}
