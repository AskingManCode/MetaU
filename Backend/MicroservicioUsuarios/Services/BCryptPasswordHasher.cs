namespace MicroservicioUsuarios.Services
{
    public class BCryptPasswordHasher : IPasswordHasher
    {
        public string Encriptar(string contrasena)
        { 
           return BCrypt.Net.BCrypt.HashPassword(contrasena);
        }

        public bool Verificar(string contrasena, string hash)
        { 
          return BCrypt.Net.BCrypt.Verify(contrasena, hash);
        }
    }
}
