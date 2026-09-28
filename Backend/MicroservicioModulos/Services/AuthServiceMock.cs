namespace MicroservicioModulos.Services
{
    public class AuthServiceMock
    {
        public Task<bool> ValidateAsync(string token)
        { 
          var Validado = !string.IsNullOrWhiteSpace(token);
            return Task.FromResult(Validado);
        }
    }
}
