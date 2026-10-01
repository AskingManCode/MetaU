namespace MicroservicioLogin.Services
{
    public interface IPasswordHasher
    {
        string Hash(string contrasenaPlano);
        bool Verify(string contrasenaPlano, string hash);
    }
}
