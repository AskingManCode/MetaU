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
            return await connection.QueryAsync<Rol>("SELECT ID_ROL, NOMBRE FROM ROL");
        }

        public async Task<Rol?> ObtenerPorIdAsync(string id)
        {
            using var connection = _dbConnectionFactory.CrearConexion();
            var sql = "SELECT ID_ROL, NOMBRE FROM ROL WHERE ID_ROL = @Id";
            return await connection.QueryFirstOrDefaultAsync<Rol>(sql, new { id });
        }

        public async Task<int> CrearAsync(Rol rol)
        {
            using var connection = _dbConnectionFactory.CrearConexion();
            var sql = "INSERT INTO ROL (ID_ROL, NOMBRE) VALUES (@Id_Rol, @Nombre)";
            return await connection.ExecuteAsync(sql, rol);
        }

        public async Task<int> ActualizarAsync(Rol rol)
        {
            using var connection = _dbConnectionFactory.CrearConexion();
            var sql = "UPDATE ROL SET NOMBRE = @Nombre WHERE ID_ROL = @Id_Rol";
            return await connection.ExecuteAsync(sql, rol);
        }

        public async Task<int> EliminarAsync(string id)
        {
            using var connection = _dbConnectionFactory.CrearConexion();
            var sql = "DELETE FROM ROL WHERE ID_ROL = @Id_Rol";
            return await connection.ExecuteAsync(sql, new { id });
        }


    }
}
