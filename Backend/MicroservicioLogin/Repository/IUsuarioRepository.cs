using MicroservicioLogin.Entities;

namespace MicroservicioLogin.Repository
{
    public interface IUsuarioRepository
    {
        Task<Usuario?> ObtenerPorEmailAsync(string email);
        Task<Usuario?> ObtenerPorIdAsync(int id);
    }
}
