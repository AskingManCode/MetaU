namespace MicroservicioLogin.Services
{
    // Hash determinista, no confundir con IPasswordHasher: el refresh token
    // se busca por su hash en la base (WHERE TokenHash = @hash), asi que dos
    // hashes del mismo texto tienen que dar siempre el mismo resultado.
    // BCrypt no sirve aca porque usa sal aleatoria.
    public interface IRefreshTokenHasher
    {
        string Hash(string refreshTokenTexto);
    }
}
