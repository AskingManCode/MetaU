using Microsoft.Data.SqlClient;
using MicroservicioProfesores.Entities;
using System.Data;

namespace MicroservicioProfesores.Repository
{
    public class ProfesorRepository : IProfesorRepository
    {
        private readonly ISqlConnectionFactory _connectionFactory;

        public ProfesorRepository(ISqlConnectionFactory connectionFactory)
        {
            _connectionFactory = connectionFactory;
        }

        public async Task<Profesor> CrearAsync(Profesor profesor)
        {
            await using var connection = _connectionFactory.CrearConexion();
            await using var command = new SqlCommand("dbo.usp_Profesor_Crear", connection);
            command.CommandType = CommandType.StoredProcedure;
            AgregarParametros(command, profesor, false);

            await connection.OpenAsync();
            await using var reader = await command.ExecuteReaderAsync();

            Profesor? creado = null;

            while (await reader.ReadAsync())
            {
                creado ??= MapearProfesor(reader);

                if (!reader.IsDBNull(6))
                    creado.Telefonos.Add(reader.GetString(6));
            }

            return creado ?? throw new InvalidOperationException("No se pudo crear el profesor");
        }

        public async Task ModificarAsync(Profesor profesor)
        {
            await using var connection = _connectionFactory.CrearConexion();
            await using var command = new SqlCommand("dbo.usp_Profesor_Modificar", connection);
            command.CommandType = CommandType.StoredProcedure;
            AgregarParametros(command, profesor, true);

            await connection.OpenAsync();
            await command.ExecuteNonQueryAsync();
        }

        public async Task EliminarAsync(int profesorID)
        {
            await using var connection = _connectionFactory.CrearConexion();
            await using var command = new SqlCommand("dbo.usp_Profesor_Eliminar", connection);
            command.CommandType = CommandType.StoredProcedure;
            command.Parameters.Add("@ProfesorID", SqlDbType.Int).Value = profesorID;

            await connection.OpenAsync();
            await command.ExecuteNonQueryAsync();
        }

        public async Task<IEnumerable<Profesor>> ObtenerTodosAsync()
        {
            var profesores = new Dictionary<int, Profesor>();

            await using var connection = _connectionFactory.CrearConexion();
            await using var command = new SqlCommand("dbo.usp_Profesor_ObtenerTodos", connection);
            command.CommandType = CommandType.StoredProcedure;

            await connection.OpenAsync();
            await using var reader = await command.ExecuteReaderAsync();

            while (await reader.ReadAsync())
            {
                var profesorID = reader.GetInt32(0);

                if (!profesores.TryGetValue(profesorID, out var profesor))
                {
                    profesor = MapearProfesor(reader);
                    profesores.Add(profesorID, profesor);
                }

                if (!reader.IsDBNull(6))
                    profesor.Telefonos.Add(reader.GetString(6));
            }

            return profesores.Values;
        }

        public async Task<Profesor?> ObtenerPorIdAsync(int profesorID)
        {
            await using var connection = _connectionFactory.CrearConexion();
            await using var command = new SqlCommand("dbo.usp_Profesor_ObtenerPorId", connection);
            command.CommandType = CommandType.StoredProcedure;
            command.Parameters.Add("@ProfesorID", SqlDbType.Int).Value = profesorID;

            await connection.OpenAsync();
            await using var reader = await command.ExecuteReaderAsync();

            Profesor? profesor = null;

            while (await reader.ReadAsync())
            {
                profesor ??= MapearProfesor(reader);

                if (!reader.IsDBNull(6))
                    profesor.Telefonos.Add(reader.GetString(6));
            }

            return profesor;
        }

        private static void AgregarParametros(SqlCommand command, Profesor profesor, bool incluirID)
        {
            if (incluirID)
                command.Parameters.Add("@ProfesorID", SqlDbType.Int).Value = profesor.ProfesorID;

            command.Parameters.Add("@TipoIdentificacionCode", SqlDbType.VarChar, 15).Value = profesor.TipoIdentificacionCode;
            command.Parameters.Add("@Identificacion", SqlDbType.VarChar, 30).Value = profesor.Identificacion;
            command.Parameters.Add("@Email", SqlDbType.VarChar, 150).Value = profesor.Email;
            command.Parameters.Add("@NombreCompleto", SqlDbType.VarChar, 175).Value = profesor.NombreCompleto;
            command.Parameters.Add("@FechaNacimiento", SqlDbType.Date).Value = profesor.FechaNacimiento.Date;

            var telefonos = command.Parameters.Add("@Telefonos", SqlDbType.Structured);
            telefonos.TypeName = "dbo.TelefonoProfesorType";
            telefonos.Value = CrearTablaTelefonos(profesor.Telefonos);
        }

        private static DataTable CrearTablaTelefonos(IEnumerable<string> telefonos)
        {
            var tabla = new DataTable();
            tabla.Columns.Add("Telefono", typeof(string));

            foreach (var telefono in telefonos)
                tabla.Rows.Add(telefono);

            return tabla;
        }

        private static Profesor MapearProfesor(SqlDataReader reader)
        {
            return new Profesor
            {
                ProfesorID = reader.GetInt32(0),
                TipoIdentificacionCode = reader.GetString(1),
                Identificacion = reader.GetString(2),
                Email = reader.GetString(3),
                NombreCompleto = reader.GetString(4),
                FechaNacimiento = reader.GetDateTime(5)
            };
        }
    }
}