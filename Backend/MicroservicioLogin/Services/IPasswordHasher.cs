namespace MicroservicioLogin.Services
{
    public interface IPasswordHasher
    {
        bool Verify(string contrasenaPlano, string hash);
    }
}
