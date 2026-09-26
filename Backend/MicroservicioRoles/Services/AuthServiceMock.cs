namespace MicroservicioRoles.Services
{
    public class AuthServiceMock : IAuthService
    {
        public Task<bool> ValidarAsync(string token)
        {
            var Valido = !string.IsNullOrWhiteSpace(token);
            return Task.FromResult(Valido);
        }
    }
}
