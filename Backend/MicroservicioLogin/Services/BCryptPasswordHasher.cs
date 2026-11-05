namespace MicroservicioLogin.Services
{
    // OJO: esto asume que ContrasenaHash en Usuarios_DB se genero con BCrypt
    // Si USR1 (Usuarios) hashea distinto, esto siempre va a fallar en Verify
    public class BCryptPasswordHasher : IPasswordHasher
    {
        public bool Verify(string contrasenaPlano, string hash) => BCrypt.Net.BCrypt.Verify(contrasenaPlano, hash);
    }
}
