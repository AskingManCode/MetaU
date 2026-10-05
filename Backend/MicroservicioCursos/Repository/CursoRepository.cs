using Microsoft.Data.SqlClient;
using MicroservicioCursos.Entities;
using System.Data;

namespace MicroservicioCursos.Repository
{
    public class CursoRepository : ICursoRepository
    {
        private readonly ISqlConnectionFactory _connectionFactory;

        public CursoRepository(ISqlConnectionFactory connectionFactory)
        {
            _connectionFactory = connectionFactory;
        }

        public async Task CrearAsync(Curso curso)
        {
            await using var connection = _connectionFactory.CrearConexion();
            await using var command = new SqlCommand("dbo.usp_Cursos_Crear", connection);
            command.CommandType = CommandType.StoredProcedure;

            AgregarParametros(command, curso);

            await connection.OpenAsync();
            await command.ExecuteNonQueryAsync();
        }

        public async Task ModificarAsync(Curso curso)
        {
            await using var connection = _connectionFactory.CrearConexion();
            await using var command = new SqlCommand("dbo.usp_Cursos_Modificar", connection);
            command.CommandType = CommandType.StoredProcedure;

            AgregarParametros(command, curso);

            await connection.OpenAsync();
            await command.ExecuteNonQueryAsync();
        }

        public async Task EliminarAsync(string cursoCode)
        {
            await using var connection = _connectionFactory.CrearConexion();
            await using var command = new SqlCommand("dbo.usp_Cursos_Eliminar", connection);
            command.CommandType = CommandType.StoredProcedure;

            command.Parameters.Add("@CursoCode", SqlDbType.VarChar, 15).Value = cursoCode;

            await connection.OpenAsync();
            await command.ExecuteNonQueryAsync();
        }

        public async Task<IEnumerable<Curso>> ObtenerTodosAsync()
        {
            var cursos = new List<Curso>();

            await using var connection = _connectionFactory.CrearConexion();
            await using var command = new SqlCommand("dbo.usp_Cursos_ObtenerTodos", connection);
            command.CommandType = CommandType.StoredProcedure;

            await connection.OpenAsync();
            await using var reader = await command.ExecuteReaderAsync();

            while (await reader.ReadAsync())
                cursos.Add(MapearCurso(reader));

            return cursos;
        }

        public async Task<Curso?> ObtenerPorIdAsync(string cursoCode)
        {
            await using var connection = _connectionFactory.CrearConexion();
            await using var command = new SqlCommand("dbo.usp_Cursos_ObtenerPorId", connection);
            command.CommandType = CommandType.StoredProcedure;

            command.Parameters.Add("@CursoCode", SqlDbType.VarChar, 15).Value = cursoCode;

            await connection.OpenAsync();
            await using var reader = await command.ExecuteReaderAsync();

            return await reader.ReadAsync() ? MapearCurso(reader) : null;
        }

        public async Task<IEnumerable<Curso>> ObtenerPorCarreraAsync(string carreraCode)
        {
            var cursos = new List<Curso>();

            await using var connection = _connectionFactory.CrearConexion();
            await using var command = new SqlCommand("dbo.usp_Cursos_ObtenerPorCarrera", connection);
            command.CommandType = CommandType.StoredProcedure;

            command.Parameters.Add("@CarreraCode", SqlDbType.VarChar, 15).Value = carreraCode;

            await connection.OpenAsync();
            await using var reader = await command.ExecuteReaderAsync();

            while (await reader.ReadAsync())
                cursos.Add(MapearCurso(reader));

            return cursos;
        }

        private static void AgregarParametros(SqlCommand command, Curso curso)
        {
            command.Parameters.Add("@CursoCode", SqlDbType.VarChar, 15).Value = curso.CursoCode;
            command.Parameters.Add("@CarreraCode", SqlDbType.VarChar, 15).Value = curso.CarreraCode;
            command.Parameters.Add("@Nombre", SqlDbType.VarChar, 150).Value = curso.Nombre;
            command.Parameters.Add("@Nivel", SqlDbType.TinyInt).Value = curso.Nivel;
            command.Parameters.Add("@Estado", SqlDbType.Bit).Value = curso.Estado;
        }

        private static Curso MapearCurso(SqlDataReader reader)
        {
            return new Curso
            {
                CursoCode = reader.GetString(0),
                CarreraCode = reader.GetString(1),
                Nombre = reader.GetString(2),
                Nivel = reader.GetByte(3),
                Estado = reader.GetBoolean(4)
            };
        }
    }
}