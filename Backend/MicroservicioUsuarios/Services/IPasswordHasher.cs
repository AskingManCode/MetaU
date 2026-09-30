namespace MicroservicioUsuarios.Services
{
    public interface IPasswordHasher
    {
        string Encriptar(string contrasena);
        bool Verificar(string contrasena, string hash);
    }
}
