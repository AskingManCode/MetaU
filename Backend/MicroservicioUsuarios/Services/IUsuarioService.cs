using MicroservicioUsuarios.Entities;

namespace MicroservicioUsuarios.Services
{
    public interface IUsuarioService
    {
        Task<IEnumerable<Usuario>> ListarAsync();
        Task<IEnumerable<Usuario>> FiltrarAsync(string? indetificacion, string? nombre, string? tipo);
        Task<Usuario?> ObtenerAsync(string email);
        Task<(bool exito, string? error)> ValidarAsync(UsuarioRequest dto, bool actualizacion);
        Task<int> CrearAsync(UsuarioRequest dto);
        Task<int> ActualizarAsync(string email, UsuarioRequest dto);
        Task<int> EliminarAsync(string email);
    }
}
