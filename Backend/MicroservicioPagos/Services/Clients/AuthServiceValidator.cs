namespace MicroservicioPagos.Services.Clients
{
    public class AuthServiceValidator : IAuthServiceValidator
    {
        private readonly IAuthServiceClient _authClient;

        public AuthServiceValidator(IAuthServiceClient authClient)
        {
            _authClient = authClient;
        }

        public async Task<(Guid Usuario, string Token, IResult? Error)> ValidarAsync(HttpRequest request)
        {
            var authorization = request.Headers.Authorization.ToString();
            if (string.IsNullOrWhiteSpace(authorization) ||
                !authorization.StartsWith("Bearer ", StringComparison.OrdinalIgnoreCase))
                return (Guid.Empty, string.Empty, Results.Unauthorized());

            var token = authorization["Bearer ".Length..].Trim();
            if (string.IsNullOrWhiteSpace(token) || !await _authClient.ValidarTokenAsync(token))
                return (Guid.Empty, string.Empty, Results.Unauthorized());

            if (!Guid.TryParse(request.Headers["UsuarioGUID"], out var usuario))
                return (Guid.Empty, string.Empty, Results.BadRequest(new { mensaje = "El usuario es requerido" }));

            return (usuario, token, null);
        }
    }
}
