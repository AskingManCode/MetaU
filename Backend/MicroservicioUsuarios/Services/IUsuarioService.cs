using MicroservicioUsuarios.Entities;

namespace MicroservicioUsuarios.Services
{
    public interface IUsuarioService
    {
        Task<IEnumerable<Usuario>> ListarAsync();
        Task<IEnumerable<Usuario>> FiltrarAsync(string? identificacion, string? nombre, string? tipo, string? dominio = null, string? rol = null);
        Task<IEnumerable<Usuario>> ConsultarAsync(string? identificacion, string? nombre, string? tipo, string? dominio = null, string? rol = null, string? ordenarPor = null, string? direccion = null);
        Task<PaginaResultado<Usuario>> ConsultarPaginadoAsync(int pagina, string? identificacion, string? nombre, string? tipo, string? dominio, string? rol, string? ordenarPor, string? direccion, Guid usuarioId, string token);
        Task<Usuario?> ObtenerAsync(string email);
        Task<(bool exito, string? error)> ValidarAsync(UsuarioRequest dto, bool actualizacion, Guid usuarioId, string token);
        Task<Usuario> CrearAsync(UsuarioRequest dto, Guid usuarioId, string token);
        Task<(Usuario Anterior, Usuario Actual)> ActualizarAsync(string email, UsuarioRequest dto, Guid usuarioId, string token);
        Task<Usuario> EliminarAsync(string email);
    }
}