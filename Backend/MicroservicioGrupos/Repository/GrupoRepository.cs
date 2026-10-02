using Microsoft.Data.SqlClient;
using MicroservicioGrupos.Entities;
using System.Data;

namespace MicroservicioGrupos.Repository
{
    public class GrupoRepository : IGrupoRepository
    {
        private readonly ISqlConnectionFactory _connectionFactory;

        public GrupoRepository(ISqlConnectionFactory connectionFactory)
        {
            _connectionFactory = connectionFactory;
        }

        public async Task CrearAsync(Grupo grupo)
        {
            await using var connection = _connectionFactory.CrearConexion();
            await using var command = new SqlCommand("dbo.usp_Grupo_Crear", connection);
            command.CommandType = CommandType.StoredProcedure;

            AgregarParametros(command, grupo);

            await connection.OpenAsync();
            await command.ExecuteNonQueryAsync();
        }

        public async Task ModificarAsync(Grupo grupo)
        {
            await using var connection = _connectionFactory.CrearConexion();
            await using var command = new SqlCommand("dbo.usp_Grupo_Modificar", connection);
            command.CommandType = CommandType.StoredProcedure;

            AgregarParametros(command, grupo);

            await connection.OpenAsync();
            await command.ExecuteNonQueryAsync();
        }

        public async Task EliminarAsync(int idGrupo)
        {
            await using var connection = _connectionFactory.CrearConexion();
            await using var command = new SqlCommand("dbo.usp_Grupo_Eliminar", connection);
            command.CommandType = CommandType.StoredProcedure;
            command.Parameters.Add("@IdGrupo", SqlDbType.Int).Value = idGrupo;

            await connection.OpenAsync();
            await command.ExecuteNonQueryAsync();
        }

        public async Task<IEnumerable<Grupo>> ObtenerTodosAsync()
        {
            var grupos = new List<Grupo>();

            await using var connection = _connectionFactory.CrearConexion();
            await using var command = new SqlCommand("dbo.usp_Grupo_ObtenerTodos", connection);
            command.CommandType = CommandType.StoredProcedure;

            await connection.OpenAsync();
            await using var reader = await command.ExecuteReaderAsync();

            while (await reader.ReadAsync())
                grupos.Add(MapearGrupo(reader));

            return grupos;
        }

        public async Task<Grupo?> ObtenerPorIdAsync(int idGrupo)
        {
            await using var connection = _connectionFactory.CrearConexion();
            await using var command = new SqlCommand("dbo.usp_Grupo_ObtenerPorId", connection);
            command.CommandType = CommandType.StoredProcedure;
            command.Parameters.Add("@IdGrupo", SqlDbType.Int).Value = idGrupo;

            await connection.OpenAsync();
            await using var reader = await command.ExecuteReaderAsync();

            return await reader.ReadAsync() ? MapearGrupo(reader) : null;
        }

        private static void AgregarParametros(SqlCommand command, Grupo grupo)
        {
            command.Parameters.Add("@IdGrupo", SqlDbType.Int).Value = grupo.IdGrupo;
            command.Parameters.Add("@NumeroGrupo", SqlDbType.Int).Value = grupo.NumeroGrupo;
            command.Parameters.Add("@IdCurso", SqlDbType.Int).Value = grupo.IdCurso;
            command.Parameters.Add("@IdProfesor", SqlDbType.Int).Value = grupo.IdProfesor;
            command.Parameters.Add("@Horario", SqlDbType.NVarChar, 100).Value = grupo.Horario;
            command.Parameters.Add("@Cupo", SqlDbType.Int).Value = grupo.Cupo;
            command.Parameters.Add("@IdPeriodo", SqlDbType.Int).Value = grupo.IdPeriodo;
        }

        private static Grupo MapearGrupo(SqlDataReader reader)
        {
            return new Grupo
            {
                IdGrupo = reader.GetInt32(0),
                NumeroGrupo = reader.GetInt32(1),
                IdCurso = reader.GetInt32(2),
                IdProfesor = reader.GetInt32(3),
                Horario = reader.GetString(4),
                Cupo = reader.GetInt32(5),
                IdPeriodo = reader.GetInt32(6)
            };
        }
    }
}