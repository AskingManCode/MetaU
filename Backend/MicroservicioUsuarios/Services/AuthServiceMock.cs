namespace MicroservicioUsuarios.Services
{
    public class AuthServiceMock : IAuthService
    {
        public Task<bool> ValidarAsync(string token)
        {
            return Task.FromResult(!string.IsNullOrWhiteSpace(token));
        }
    }
}
