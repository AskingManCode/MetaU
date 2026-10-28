using Dapper;
using MicroservicioRoles.Entities;

namespace MicroservicioRoles.Repository
{
    public class RolRepository
    {
        private readonly IDbConnectionFactory _dbConnectionFactory;

        public RolRepository(IDbConnectionFactory dbConnectionFactory)
        {
            _dbConnectionFactory = dbConnectionFactory;
        }

        public async Task<IEnumerable<Rol>> ObtenerTodosAsync()
        {
            using var connection = _dbConnectionFactory.CrearConexion();
            var sql = "SELECT RolCode AS IdRol, NombreRol AS Nombre FROM [MetaU_DB_User].[Roles]";
            return await connection.QueryAsync<Rol>(sql);
        }

        public async Task<Rol?> ObtenerPorIdAsync(string id)
        {
            using var connection = _dbConnectionFactory.CrearConexion();
            var sql = "SELECT RolCode AS IdRol, NombreRol AS Nombre FROM [MetaU_DB_User].[Roles] WHERE RolCode = @id";
            return await connection.QueryFirstOrDefaultAsync<Rol>(sql, new { id });
        }

        public async Task<int> CrearAsync(Rol rol)
        {
            using var connection = _dbConnectionFactory.CrearConexion();
            var sql = "INSERT INTO [MetaU_DB_User].[Roles] (RolCode, NombreRol) VALUES (@IdRol, @Nombre)";
            return await connection.ExecuteAsync(sql, rol);
        }

        public async Task<int> ActualizarAsync(Rol rol)
        {
            using var connection = _dbConnectionFactory.CrearConexion();
            var sql = "UPDATE [MetaU_DB_User].[Roles] SET NombreRol = @Nombre WHERE RolCode = @IdRol";
            return await connection.ExecuteAsync(sql, rol);
        }

        public async Task<int> EliminarAsync(string id)
        {
            using var connection = _dbConnectionFactory.CrearConexion();
            var sql = "DELETE FROM [MetaU_DB_User].[Roles] WHERE RolCode = @id";
            return await connection.ExecuteAsync(sql, new { id });
        }

        public async Task<IEnumerable<RolModulo>> ObtenerPermisosAsync(string rolId)
        {
            using var connection = _dbConnectionFactory.CrearConexion();
            var sql = @"SELECT m.ModuloCode AS IdModulo, m.Nombre, CAST(ISNULL(rm.Estado, 0) AS BIT) AS Estado
                FROM [MetaU_DB_User].[Modulos] m
                LEFT JOIN [MetaU_DB_User].[RolesXModulos] rm
                       ON rm.ModuloCode = m.ModuloCode AND rm.RolCode = @rolId
                ORDER BY m.Nombre";
            return await connection.QueryAsync<RolModulo>(sql, new { rolId });
        }

        public async Task<int> ActualizarPermisosAsync(string rolId, IEnumerable<RolModulo> permisos)
        {
            using var connection = _dbConnectionFactory.CrearConexion();
            connection.Open();
            using var transaction = connection.BeginTransaction();

            try
            {
                var sql = @"MERGE [MetaU_DB_User].[RolesXModulos] AS destino
                    USING (SELECT @rolId AS RolCode, @moduloId AS ModuloCode) AS origen
                       ON destino.RolCode = origen.RolCode AND destino.ModuloCode = origen.ModuloCode
                    WHEN MATCHED THEN UPDATE SET Estado = @estado
                    WHEN NOT MATCHED THEN INSERT (RolCode, ModuloCode, Estado) VALUES (@rolId, @moduloId, @estado);";

                var filas = 0;
                foreach (var permiso in permisos)
                {
                    filas += await connection.ExecuteAsync(
                        sql,
                        new { rolId, moduloId = permiso.IdModulo, estado = permiso.Estado },
                        transaction);
                }

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