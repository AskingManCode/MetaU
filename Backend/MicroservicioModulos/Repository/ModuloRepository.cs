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
            return await connection.QueryAsync<Modulos>("SELECT ID_MODULO, NOMBRE FROM MODULO");
        }

        public async Task<Modulos> ObtenerPorIdAsync(string id)
        {
            using var connection = _dbconnectionFactory.CrearConexion();
            var sql = "SELECT ID_MODULO, NOMBRE FROM MODELO WHERE ID_MODELO = @id";
            return await connection.QueryFirstOrDefaultAsync<Modulos>(sql, new { id });
        }

        public async Task<int> CrearAsync(Modulos modulos)
        {
            using var connection = _dbconnectionFactory.CrearConexion();
            var sql = "INSERT INTO MODULO (ID_MODULO, NOMBRE) VALUES (@IdModulo, @Nombre)";
            return await connection.ExecuteAsync(sql, modulos);
        }

        public async Task<int> ActualizarAsync(Modulos modulos)
        {
            using var connection = _dbconnectionFactory.CrearConexion();
            var sql = "UPDATE MODULO SET NOMBRE = @Nombre WHERE ID_MODULO = @IdModulo";
            return await connection.ExecuteAsync(sql, modulos);
        }

        public async Task<int> EliminarAsync(string id)
        {
            using var connection = _dbconnectionFactory.CrearConexion();
            var sql = "DELETE FROM MODULO WHERE ID_MODULO = @id";
            return await connection.ExecuteAsync(sql, new { id });
        }

    }
}
