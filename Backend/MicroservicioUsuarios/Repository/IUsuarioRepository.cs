using MicroservicioUsuarios.Entities;

namespace MicroservicioUsuarios.Repository
{
    public interface IUsuarioRepository
    {
        Task<IEnumerable<Usuario>> ListarAsync();
        Task<IEnumerable<Usuario>> FiltrarAsync(string? indetificacion, string? nombre, string? tipo);
        Task<Usuario?> ObtenerPorEmailAsync(string email);
        Task<int> CrearAsync(Usuario usuario);
        Task<int> ActualizarAsync(Usuario usuario);
        Task<int> EliminarAsync(string email);
    }
}
