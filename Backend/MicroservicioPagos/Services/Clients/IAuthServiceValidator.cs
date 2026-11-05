namespace MicroservicioPagos.Services.Clients
{
    public interface IAuthServiceValidator
    {
        Task<(Guid Usuario, string Token, IResult? Error)> ValidarAsync(HttpRequest request);
    }
}
