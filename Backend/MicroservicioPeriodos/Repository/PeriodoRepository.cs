using Microsoft.Data.SqlClient;
using MicroservicioPeriodos.Entities;
using System.Data;

namespace MicroservicioPeriodos.Repository
{
    public class PeriodoRepository : IPeriodoRepository
    {
        private readonly ISqlConnectionFactory _connectionFactory;

        public PeriodoRepository(ISqlConnectionFactory connectionFactory)
        {
            _connectionFactory = connectionFactory;
        }

        public async Task<Periodo> CrearAsync(Periodo periodo)
        {
            await using var connection = _connectionFactory.CrearConexion();
            await using var command = new SqlCommand("dbo.usp_Periodo_Crear", connection);
            command.CommandType = CommandType.StoredProcedure;
            AgregarParametros(command, periodo, false);

            await connection.OpenAsync();
            await using var reader = await command.ExecuteReaderAsync();

            if (await reader.ReadAsync())
                return MapearPeriodo(reader);

            throw new InvalidOperationException("No se pudo crear el periodo");
        }

        public async Task ModificarAsync(Periodo periodo)
        {
            await using var connection = _connectionFactory.CrearConexion();
            await using var command = new SqlCommand("dbo.usp_Periodo_Modificar", connection);
            command.CommandType = CommandType.StoredProcedure;
            AgregarParametros(command, periodo, true);

            await connection.OpenAsync();
            await command.ExecuteNonQueryAsync();
        }

        public async Task EliminarAsync(int periodoID)
        {
            await using var connection = _connectionFactory.CrearConexion();
            await using var command = new SqlCommand("dbo.usp_Periodo_Eliminar", connection);
            command.CommandType = CommandType.StoredProcedure;
            command.Parameters.Add("@PeriodoID", SqlDbType.Int).Value = periodoID;

            await connection.OpenAsync();
            await command.ExecuteNonQueryAsync();
        }

        public async Task<IEnumerable<Periodo>> ObtenerTodosAsync()
        {
            var periodos = new List<Periodo>();
            await using var connection = _connectionFactory.CrearConexion();
            await using var command = new SqlCommand("dbo.usp_Periodo_ObtenerTodos", connection);
            command.CommandType = CommandType.StoredProcedure;

            await connection.OpenAsync();
            await using var reader = await command.ExecuteReaderAsync();

            while (await reader.ReadAsync())
                periodos.Add(MapearPeriodo(reader));

            return periodos;
        }

        public async Task<Periodo?> ObtenerPorIdAsync(int periodoID)
        {
            await using var connection = _connectionFactory.CrearConexion();
            await using var command = new SqlCommand("dbo.usp_Periodo_ObtenerPorId", connection);
            command.CommandType = CommandType.StoredProcedure;
            command.Parameters.Add("@PeriodoID", SqlDbType.Int).Value = periodoID;

            await connection.OpenAsync();
            await using var reader = await command.ExecuteReaderAsync();

            return await reader.ReadAsync() ? MapearPeriodo(reader) : null;
        }

        private static void AgregarParametros(SqlCommand command, Periodo periodo, bool incluirId)
        {
            if (incluirId)
                command.Parameters.Add("@PeriodoID", SqlDbType.Int).Value = periodo.PeriodoID;

            command.Parameters.Add("@Anio", SqlDbType.SmallInt).Value = periodo.Anio;
            command.Parameters.Add("@NumeroPeriodo", SqlDbType.Int).Value = periodo.NumeroPeriodo;
            command.Parameters.Add("@FechaInicio", SqlDbType.Date).Value = periodo.FechaInicio.Date;
            command.Parameters.Add("@FechaFin", SqlDbType.Date).Value = periodo.FechaFin.Date;
        }

        private static Periodo MapearPeriodo(SqlDataReader reader)
        {
            return new Periodo
            {
                PeriodoID = reader.GetInt32(0),
                Anio = reader.GetInt16(1),
                NumeroPeriodo = reader.GetInt32(2),
                FechaInicio = reader.GetDateTime(3),
                FechaFin = reader.GetDateTime(4)
            };
        }
    }
}