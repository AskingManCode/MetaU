namespace MicroservicioFacturacion.Services.Clients
{
    public class AuthServiceValidator: IAuthServiceValidator
    {
        private readonly IAuthServiceClient _authClient;

        public AuthServiceValidator(IAuthServiceClient authClient)
        {
            this._authClient = authClient;
        }
        public async Task<(Guid Usuario, string Token, IResult? Error)> ValidarAsync(HttpRequest request)
        {
            var authorization = request.Headers.Authorization.ToString();

            if (string.IsNullOrWhiteSpace(authorization) ||
                !authorization.StartsWith("Bearer ", StringComparison.OrdinalIgnoreCase))
            {
                return (Guid.Empty, string.Empty, Results.Unauthorized());
            }

            var token = authorization["Bearer ".Length..].Trim();

            if (string.IsNullOrWhiteSpace(token))
                return (Guid.Empty, string.Empty, Results.Unauthorized());

            var esValido = await _authClient.ValidarTokenAsync(token);

            if (!esValido)
                return (Guid.Empty, string.Empty, Results.Unauthorized());
            
            var usuarioHeader = request.Headers["UsuarioGUID"].ToString();

            if (!Guid.TryParse(usuarioHeader, out var usuario))
                return (Guid.Empty, string.Empty, Results.BadRequest(new { mensaje = "El usuario es requerido" }));

            return (usuario, token, null);
        }
    }
}
