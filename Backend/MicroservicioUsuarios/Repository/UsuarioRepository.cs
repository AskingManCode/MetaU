using Dapper;
using Microsoft.Data.SqlClient;
using MicroservicioUsuarios.Entities;
using System.Data;

namespace MicroservicioUsuarios.Repository
{
    public class UsuarioRepository : IUsuarioRepository
    {
        private readonly string _connectionString;

        public UsuarioRepository(IConfiguration configuration)
        {
            _connectionString = configuration.GetConnectionString("UsuariosDB")
                ?? throw new InvalidOperationException("No se encontro la cadena de conexion UsuariosDB");
        }

        private IDbConnection CrearConexion() => new SqlConnection(_connectionString);

        public async Task<IEnumerable<Usuario>> ListarAsync()
        {
            using var connection = CrearConexion();
            const string sql = @"SELECT UsuarioID AS UsuarioId, RolCode, TipoIdentificacionCode, Identificacion,
                                         NombreCompleto, Email, ContrasenaHash, Estado
                                  FROM Usuarios";
            return await connection.QueryAsync<Usuario>(sql);
        }

        public async Task<IEnumerable<Usuario>> FiltrarAsync(string? identificacion, string? nombre, string? tipo)
        {
            using var connection = CrearConexion();
            const string sql = @"SELECT UsuarioID AS UsuarioId, RolCode, TipoIdentificacionCode, Identificacion,
                                         NombreCompleto, Email, ContrasenaHash, Estado
                                  FROM Usuarios WHERE (@identificacion IS NULL OR Identificacion = @identificacion)
                                    AND (@nombre IS NULL OR NombreCompleto LIKE '%' + @nombre + '%')
                                    AND (@tipo IS NULL OR TipoIdentificacionCode = @tipo)";
            return await connection.QueryAsync<Usuario>(sql, new { identificacion, nombre, tipo });
        }

        public async Task<Usuario?> ObtenerPorEmailAsync(string email)
        {
            using var connection = CrearConexion();
            const string sql = @"SELECT UsuarioID AS UsuarioId, RolCode, TipoIdentificacionCode, Identificacion,
                                         NombreCompleto, Email, ContrasenaHash, Estado
                                  FROM Usuarios WHERE Email = @email";
            return await connection.QueryFirstOrDefaultAsync<Usuario>(sql, new { email });
        }

        public async Task<int> CrearAsync(Usuario usuario)
        {
            using var connection = CrearConexion();
            const string sql = @"INSERT INTO Usuarios
                                    (UsuarioID, RolCode, TipoIdentificacionCode, Identificacion, NombreCompleto, Email, ContrasenaHash, Estado)
                                  VALUES
                                    (@UsuarioId, @RolCode, @TipoIdentificacionCode, @Identificacion, @NombreCompleto, @Email, @ContrasenaHash, @Estado)";
            return await connection.ExecuteAsync(sql, usuario);
        }

        public async Task<int> ActualizarAsync(Usuario usuario)
        {
            using var connection = CrearConexion();
            const string sql = @"UPDATE Usuarios SET RolCode = @RolCode, TipoIdentificacionCode = @TipoIdentificacionCode,
                                 Identificacion = @Identificacion, NombreCompleto = @NombreCompleto,
                                 ContrasenaHash = @ContrasenaHash, Estado = @Estado WHERE Email = @Email";
            return await connection.ExecuteAsync(sql, usuario);
        }

        public async Task<int> EliminarAsync(string email)
        {
            using var connection = CrearConexion();
            const string sql = "DELETE FROM Usuarios WHERE Email = @email";
            return await connection.ExecuteAsync(sql, new { email });
        }
    }
}