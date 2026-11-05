using System.Text.Json.Serialization;

namespace MicroservicioLogin.DTOs
{
    
    public class LoginResponse
    {
        [JsonPropertyName("expires_in")]
        public DateTime ExpiresIn { get; set; }

        [JsonPropertyName("access_token")]
        public string AccessToken { get; set; } = string.Empty;

        [JsonPropertyName("refresh_token")]
        public string RefreshToken { get; set; } = string.Empty;

        [JsonPropertyName("usuarioID")]
        public Guid UsuarioId { get; set; }
    }
}
