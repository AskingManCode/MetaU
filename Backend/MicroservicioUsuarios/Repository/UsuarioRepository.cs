using Dapper;
using Microsoft.Data.SqlClient;
using MicroservicioUsuarios.Entities;
using System.Data;

namespace MicroservicioUsuarios.Repository
{
    public class UsuarioRepository : IUsuarioRepository
    {
        private readonly string _connectionString;

        private const string SqlBase = @"SELECT UsuarioID AS UsuarioId, RolCode, TipoIdentificacionCode, Identificacion,
                                                NombreCompleto, Email, ContrasenaHash, Estado, FechaModificacion
                                         FROM [MetaU_DB_User].[Usuarios]";

        public UsuarioRepository(IConfiguration configuration)
        {
            _connectionString = configuration.GetConnectionString("UsuariosDB")
                ?? throw new InvalidOperationException("No se encontro la cadena de conexion UsuariosDB");
        }

        private IDbConnection CrearConexion() => new SqlConnection(_connectionString);

        public async Task<IEnumerable<Usuario>> ListarAsync()
        {
            using var connection = CrearConexion();
            return await connection.QueryAsync<Usuario>(SqlBase);
        }

        public async Task<IEnumerable<Usuario>> FiltrarAsync(string? identificacion, string? nombre, string? tipo, string? dominio = null, string? rol = null)
        {
            using var connection = CrearConexion();
            const string sql = SqlBase + @"
                         WHERE (@identificacion IS NULL OR Identificacion = @identificacion)
                           AND (@nombre IS NULL OR NombreCompleto LIKE '%' + @nombre + '%')
                           AND (@tipo IS NULL OR TipoIdentificacionCode = @tipo)
                           AND (@dominio IS NULL OR Email LIKE '%@' + @dominio)
                           AND (@rol IS NULL OR RolCode = @rol)";
            return await connection.QueryAsync<Usuario>(sql, new { identificacion, nombre, tipo, dominio, rol });
        }

        public async Task<Usuario?> ObtenerPorEmailAsync(string email)
        {
            using var connection = CrearConexion();
            const string sql = SqlBase + " WHERE Email = @email";
            return await connection.QueryFirstOrDefaultAsync<Usuario>(sql, new { email });
        }

        public async Task<int> CrearAsync(Usuario usuario)
        {
            using var connection = CrearConexion();
            const string sql = @"INSERT INTO [MetaU_DB_User].[Usuarios]
                                    (UsuarioID, RolCode, TipoIdentificacionCode, Identificacion, NombreCompleto, Email, ContrasenaHash, Estado)
                                 VALUES
                                    (@UsuarioId, @RolCode, @TipoIdentificacionCode, @Identificacion, @NombreCompleto, @Email, @ContrasenaHash, @Estado)";
            return await connection.ExecuteAsync(sql, usuario);
        }

        public async Task<int> ActualizarAsync(Usuario usuario)
        {
            using var connection = CrearConexion();
            const string sql = @"UPDATE [MetaU_DB_User].[Usuarios]
                                 SET RolCode = @RolCode, TipoIdentificacionCode = @TipoIdentificacionCode,
                                     Identificacion = @Identificacion, NombreCompleto = @NombreCompleto,
                                     ContrasenaHash = @ContrasenaHash, Estado = @Estado,
                                     FechaModificacion = SYSDATETIME()
                                 WHERE Email = @Email";
            return await connection.ExecuteAsync(sql, usuario);
        }

        public async Task<int> EliminarAsync(string email)
        {
            using var connection = CrearConexion();
            connection.Open();
            using var transaction = connection.BeginTransaction();

            try
            {
                await connection.ExecuteAsync(
                    @"DELETE rt FROM [MetaU_DB_User].[RefreshToken] rt
                      INNER JOIN [MetaU_DB_User].[Usuarios] u ON u.UsuarioID = rt.UsuarioID
                      WHERE u.Email = @email",
                    new { email }, transaction);

                var filas = await connection.ExecuteAsync(
                    "DELETE FROM [MetaU_DB_User].[Usuarios] WHERE Email = @email",
                    new { email }, transaction);

                transaction.Commit();
                return filas;
            }
            catch
            {
                transaction.Rollback();
                throw;
            }
        }
    }
}