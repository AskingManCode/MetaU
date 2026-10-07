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
            var sql = "SELECT ModuloCode AS IdModulo, Nombre FROM Modulos";
            return await connection.QueryAsync<Modulos>(sql);
        }

        public async Task<Modulos> ObtenerPorIdAsync(string id)
        {
            using var connection = _dbconnectionFactory.CrearConexion();
            var sql = "SELECT ModuloCode AS IdModulo, Nombre FROM Modulos WHERE ModuloCode = @id";
            return await connection.QueryFirstOrDefaultAsync<Modulos>(sql, new { id });
        }

        public async Task<int> CrearAsync(Modulos modulos)
        {
            using var connection = _dbconnectionFactory.CrearConexion();
            var sql = "INSERT INTO Modulos (ModuloCode, Nombre) VALUES (@IdModulo, @Nombre)";
            return await connection.ExecuteAsync(sql, modulos);
        }

        public async Task<int> ActualizarAsync(Modulos modulos)
        {
            using var connection = _dbconnectionFactory.CrearConexion();
            var sql = "UPDATE Modulos SET Nombre = @Nombre WHERE ModuloCode = @IdModulo";
            return await connection.ExecuteAsync(sql, modulos);
        }

        public async Task<int> EliminarAsync(string id)
        {
            using var connection = _dbconnectionFactory.CrearConexion();
            var sql = "DELETE FROM Modulos WHERE ModuloCode = @id";
            return await connection.ExecuteAsync(sql, new { id });
        }

    }
}
