using ApiGateway.Clients;

namespace ApiGateway.Middleware
{
    public class AuthMiddleware
    {
        private static readonly string[] RutasNoProtegidas =
        [
            "/gateway/auth/login",
            "/gateway/auth/refresh",
            "/gateway/health"
        ];
        private readonly RequestDelegate _next;
        private readonly ILogger<AuthMiddleware> _logger;

        public AuthMiddleware(RequestDelegate next, ILogger<AuthMiddleware> logger)
        {
            _next = next;
            _logger = logger;
        }

        public async Task InvokeAsync(HttpContext context, IAuthServiceClient authServiceClient)
        {
            if (HttpMethods.IsOptions(context.Request.Method))
            {
                await _next(context);
                return;
            }

            var path = context.Request.Path.Value?.TrimEnd('/') ?? string.Empty;

            if (RutasNoProtegidas.Any(ruta => string.Equals(path, ruta, StringComparison.OrdinalIgnoreCase)))
            {
                await _next(context);
                return;
            }

            var authorization = context.Request.Headers.Authorization.ToString();

            if (string.IsNullOrWhiteSpace(authorization) || !authorization.StartsWith("Bearer ", StringComparison.OrdinalIgnoreCase))
            {
                await ResponderErrorAsync(context, StatusCodes.Status401Unauthorized, "No autorizado.");
                return;
            }

            var token = authorization["Bearer ".Length..].Trim();

            if (string.IsNullOrWhiteSpace(token))
            {
                await ResponderErrorAsync(context, StatusCodes.Status401Unauthorized, "No autorizado.");
                return;
            }

            bool esValido;

            try
            {
                esValido = await authServiceClient.ValidarTokenAsync(token);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error al comunicarse con MicroservicioLogin.");
                await ResponderErrorAsync(context, StatusCodes.Status503ServiceUnavailable, "Servicio de autenticacion no disponible temporalmente.");
                return;
            }

            if (!esValido)
            {
                await ResponderErrorAsync(context, StatusCodes.Status401Unauthorized, "No autorizado.");
                return;
            }

            await _next(context);
        }

        private static async Task ResponderErrorAsync(HttpContext context, int statusCode, string mensaje)
        {
            context.Response.StatusCode = statusCode;

            if (statusCode == StatusCodes.Status401Unauthorized)
            {
                context.Response.Headers.WWWAuthenticate = "Bearer";
            }

            await context.Response.WriteAsJsonAsync(new { mensaje });
        }
    }
}
