namespace ApiGateway;

public static class ApiGatewayEndpoints
{
    public static void MapApiGatewayEndpoints(this IEndpointRouteBuilder app)
    {
        app.MapGet("/gateway/health", () => Results.Ok(new
        {
            status = "Healthy",
            service = "ApiGateway",
            timestamp = DateTime.UtcNow
        }));
    }
}