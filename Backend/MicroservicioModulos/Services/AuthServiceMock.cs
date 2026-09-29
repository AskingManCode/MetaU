namespace MicroservicioModulos.Services
{
    public class AuthServiceMock : IAuthService
    {
        public Task<bool> ValidarAsync(string token)
        { 
          var Validado = !string.IsNullOrWhiteSpace(token);
            return Task.FromResult(Validado);
        }
    }
}
