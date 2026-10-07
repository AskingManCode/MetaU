using Dapper;
using MicroservicioLogin.Database;
using MicroservicioLogin.Entities;

namespace MicroservicioLogin.Repository
{
    public class UsuarioRepository : IUsuarioRepository
    {
        private readonly IDbConnectionFactory _conexiones;

        public UsuarioRepository(IDbConnectionFactory conexiones)
        {
            _conexiones = conexiones;
        }

        public async Task<Usuario?> ObtenerPorEmailAsync(string email)
        {
            const string sql = @"
                SELECT UsuarioID, RolCode, Email, ContrasenaHash, Estado
                FROM Usuarios
                WHERE Email = @Email";

            using var conexion = _conexiones.CrearConexion();
            return await conexion.QuerySingleOrDefaultAsync<Usuario>(sql, new { Email = email });
        }

        public async Task<Usuario?> ObtenerPorIdAsync(Guid usuarioId)
        {
            const string sql = @"
                SELECT UsuarioID, RolCode, Email, ContrasenaHash, Estado
                FROM Usuarios
                WHERE UsuarioID = @UsuarioId";

            using var conexion = _conexiones.CrearConexion();
            return await conexion.QuerySingleOrDefaultAsync<Usuario>(sql, new { UsuarioId = usuarioId });
        }
    }
}
