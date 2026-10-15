using MicroservicioUsuarios.Entities;

namespace MicroservicioUsuarios.Services
{
    public interface IUsuarioService
    {
        Task<IEnumerable<Usuario>> ListarAsync();
        Task<IEnumerable<Usuario>> FiltrarAsync(string? indetificacion, string? nombre, string? tipo);
        Task<IEnumerable<Usuario>> ConsultarAsync(string? identificacion, string? nombre, string? tipo);
        Task<Usuario?> ObtenerAsync(string email);
        Task<(bool exito, string? error)> ValidarAsync(UsuarioRequest dto, bool actualizacion, Guid usuarioId, string token);
        Task<Usuario> CrearAsync(UsuarioRequest dto, Guid usuarioId, string token);
        Task<(Usuario Anterior, Usuario Actual)> ActualizarAsync(string email, UsuarioRequest dto, Guid usuarioId, string token);
        Task<Usuario> EliminarAsync(string email);
    }
}