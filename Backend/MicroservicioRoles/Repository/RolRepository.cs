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
            var sql = "SELECT RolCode AS IdRol, NombreRol AS Nombre FROM Roles";
            return await connection.QueryAsync<Rol>(sql);
        }

        public async Task<Rol?> ObtenerPorIdAsync(string id)
        {
            using var connection = _dbConnectionFactory.CrearConexion();
            var sql = "SELECT RolCode AS IdRol, NombreRol AS Nombre FROM Roles WHERE RolCode = @id";
            return await connection.QueryFirstOrDefaultAsync<Rol>(sql, new { id });
        }

        public async Task<int> CrearAsync(Rol rol)
        {
            using var connection = _dbConnectionFactory.CrearConexion();
            var sql = "INSERT INTO Roles (RolCode, NombreRol) VALUES (@IdRol, @Nombre)";
            return await connection.ExecuteAsync(sql, rol);
        }

        public async Task<int> ActualizarAsync(Rol rol)
        {
            using var connection = _dbConnectionFactory.CrearConexion();
            var sql = "UPDATE Roles SET NombreRol = @Nombre WHERE RolCode = @IdRol";
            return await connection.ExecuteAsync(sql, rol);
        }

        public async Task<int> EliminarAsync(string id)
        {
            using var connection = _dbConnectionFactory.CrearConexion();
            var sql = "DELETE FROM Roles WHERE RolCode = @id";
            return await connection.ExecuteAsync(sql, new { id });
        }


    }
}
