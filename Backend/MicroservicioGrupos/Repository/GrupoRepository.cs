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

        public async Task EliminarAsync(string grupoCode)
        {
            await using var connection = _connectionFactory.CrearConexion();
            await using var command = new SqlCommand("dbo.usp_Grupo_Eliminar", connection);
            command.CommandType = CommandType.StoredProcedure;
            command.Parameters.Add("@GrupoCode", SqlDbType.VarChar, 15).Value = grupoCode;

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

        public async Task<Grupo?> ObtenerPorIdAsync(string grupoCode)
        {
            await using var connection = _connectionFactory.CrearConexion();
            await using var command = new SqlCommand("dbo.usp_Grupo_ObtenerPorId", connection);
            command.CommandType = CommandType.StoredProcedure;
            command.Parameters.Add("@GrupoCode", SqlDbType.VarChar, 15).Value = grupoCode;

            await connection.OpenAsync();
            await using var reader = await command.ExecuteReaderAsync();

            return await reader.ReadAsync() ? MapearGrupo(reader) : null;
        }

        private static void AgregarParametros(SqlCommand command, Grupo grupo)
        {
            command.Parameters.Add("@GrupoCode", SqlDbType.VarChar, 15).Value = grupo.GrupoCode;
            command.Parameters.Add("@NumeroGrupo", SqlDbType.TinyInt).Value = grupo.NumeroGrupo;
            command.Parameters.Add("@CursoCode", SqlDbType.VarChar, 15).Value = grupo.CursoCode;
            command.Parameters.Add("@ProfesorID", SqlDbType.UniqueIdentifier).Value = grupo.ProfesorID;
            command.Parameters.Add("@Horario", SqlDbType.VarChar, 30).Value = grupo.Horario;
            command.Parameters.Add("@Cupo", SqlDbType.Int).Value = grupo.Cupo;
            command.Parameters.Add("@PeriodoID", SqlDbType.UniqueIdentifier).Value = grupo.PeriodoID;
            command.Parameters.Add("@Estado", SqlDbType.Bit).Value = grupo.Estado;
        }

        private static Grupo MapearGrupo(SqlDataReader reader)
        {
            return new Grupo
            {
                GrupoCode = reader.GetString(reader.GetOrdinal("GrupoCode")),
                NumeroGrupo = reader.GetByte(reader.GetOrdinal("NumeroGrupo")),
                CursoCode = reader.GetString(reader.GetOrdinal("CursoCode")),
                ProfesorID = reader.GetGuid(reader.GetOrdinal("ProfesorID")),
                Horario = reader.GetString(reader.GetOrdinal("Horario")),
                Cupo = reader.GetInt32(reader.GetOrdinal("Cupo")),
                PeriodoID = reader.GetGuid(reader.GetOrdinal("PeriodoID")),
                Estado = reader.GetBoolean(reader.GetOrdinal("Estado"))
            };
        }
    }
}