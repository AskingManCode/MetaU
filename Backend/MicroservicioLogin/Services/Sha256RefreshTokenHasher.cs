using System.Security.Cryptography;
using System.Text;

namespace MicroservicioLogin.Services
{
    public class Sha256RefreshTokenHasher : IRefreshTokenHasher
    {
        public string Hash(string refreshTokenTexto)
        {
            var bytes = SHA256.HashData(Encoding.UTF8.GetBytes(refreshTokenTexto));
            return Convert.ToHexString(bytes);
        }
    }
}
