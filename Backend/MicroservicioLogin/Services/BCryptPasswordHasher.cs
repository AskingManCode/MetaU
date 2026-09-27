using BCrypt.Net;

namespace MicroservicioLogin.Services
{
    public class BCryptPasswordHasher : IPasswordHasher
    {
        public string Hash(string contrasenaPlano) => BCrypt.Net.BCrypt.HashPassword(contrasenaPlano);
        public bool Verify(string contrasenaPlano, string hash) => BCrypt.Net.BCrypt.Verify(contrasenaPlano, hash);
    }
}
