namespace MicroservicioUsuarios.Services.Helpers
{
    public interface IPasswordHasher
    {
        string Encriptar(string contrasena);
        bool Verificar(string contrasena, string hash);
    }
}
