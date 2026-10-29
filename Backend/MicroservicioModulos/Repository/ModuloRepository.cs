using Dapper;
using MicroservicioModulos.Entities;

namespace MicroservicioModulos.Repository
{
    public class ModuloRepository
    {
        private readonly IDbConnectionFactory _dbconnectionFactory;

        public ModuloRepository(IDbConnectionFactory dbConnectionFactory)
        {
            _dbconnectionFactory = dbConnectionFactory;
        }

        public async Task<IEnumerable<Modulos>> ObtenerTodosAsync()
        {
            using var connection = _dbconnectionFactory.CrearConexion();
            var sql = @"SELECT ModuloCode AS IdModulo, Nombre, Estado, Orden
                        FROM [MetaU_DB_User].[Modulos]
                        ORDER BY Orden, Nombre";
            return await connection.QueryAsync<Modulos>(sql);
        }

        public async Task<Modulos?> ObtenerPorIdAsync(string id)
        {
            using var connection = _dbconnectionFactory.CrearConexion();
            var sql = "SELECT ModuloCode AS IdModulo, Nombre, Estado, Orden FROM [MetaU_DB_User].[Modulos] WHERE ModuloCode = @id";
            return await connection.QueryFirstOrDefaultAsync<Modulos>(sql, new { id });
        }

        public async Task<int> CrearAsync(Modulos modulos)
        {
            using var connection = _dbconnectionFactory.CrearConexion();
            var sql = @"INSERT INTO [MetaU_DB_User].[Modulos] (ModuloCode, Nombre, Estado, Orden)
                        VALUES (@IdModulo, @Nombre, ISNULL(@Estado, 1), ISNULL(@Orden, 0))";
            return await connection.ExecuteAsync(sql, modulos);
        }

        public async Task<int> ActualizarAsync(Modulos modulos)
        {
            using var connection = _dbconnectionFactory.CrearConexion();
            var sql = @"UPDATE [MetaU_DB_User].[Modulos]
                        SET Nombre = @Nombre,
                            Estado = ISNULL(@Estado, Estado),
                            Orden = ISNULL(@Orden, Orden)
                        WHERE ModuloCode = @IdModulo";
            return await connection.ExecuteAsync(sql, modulos);
        }

        public async Task<int> EliminarAsync(string id)
        {
            using var connection = _dbconnectionFactory.CrearConexion();
            var sql = "DELETE FROM [MetaU_DB_User].[Modulos] WHERE ModuloCode = @id";
            return await connection.ExecuteAsync(sql, new { id });
        }

        public async Task<bool> TieneRolAsignadosAsync(string id)
        {
            using var connection = _dbconnectionFactory.CrearConexion();
            var sql = @"SELECT CAST(CASE WHEN EXISTS (
                            SELECT 1 FROM [MetaU_DB_User].[RolesXModulos] WHERE ModuloCode = @id
                        ) THEN 1 ELSE 0 END AS BIT)";
            return await connection.ExecuteScalarAsync<bool>(sql, new { id });
        }
    }
}