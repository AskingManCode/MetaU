namespace MicroservicioMatriculas.Services
{
    public interface IAuthClient
    {
        Task<bool> Validate(string token);
    }
}
