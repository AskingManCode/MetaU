namespace MicroservicioUsuarios.Services
{
    public class AuthServiceMock
    {
        public Task<bool> ValidarAsync(string token)
        {
            return Task.FromResult(!string.IsNullOrWhiteSpace(token));
        }
    }
}
