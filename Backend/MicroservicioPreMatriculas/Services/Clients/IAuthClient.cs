namespace MicroservicioPreMatriculas.Services
{
    public interface IAuthClient
    {
        Task<bool> Validate(string token);
    }
}