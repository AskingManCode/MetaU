using Microsoft.Data.SqlClient;
using MicroservicioBitacoras.Entities;
using System.Data;

namespace MicroservicioBitacoras.Repository
{
    public class BitacoraRepository : IBitacoraRepository
    {
        private readonly string _connectionString;

        public BitacoraRepository(IConfiguration configuration)
        {
            _connectionString = configuration.GetConnectionString("SeguridadAuditoria")
                ?? throw new InvalidOperationException("No se encontro la cadena de conexion SeguridadAuditoria");
        }

        public async Task RegistrarAsync(int usuario, string descripcion)
        {
            const string query = """
                INSERT INTO dbo.Bitacora (Usuario, Descripcion)
                VALUES (@Usuario, @Descripcion)
                """;

            await using var connection = new SqlConnection(_connectionString);
            await using var command = new SqlCommand(query, connection);

            command.Parameters.Add("@Usuario", SqlDbType.Int).Value = usuario;
            command.Parameters.Add("@Descripcion", SqlDbType.NVarChar, -1).Value = descripcion;

            await connection.OpenAsync();
            await command.ExecuteNonQueryAsync();
        }

        public async Task<IEnumerable<Bitacora>> ObtenerTodosAsync()
        {
            const string query = """
                SELECT IdBitacora, FechaBitacora, Usuario, Descripcion
                FROM dbo.Bitacora
                """;

            var bitacoras = new List<Bitacora>();
            await using var connection = new SqlConnection(_connectionString);
            await using var command = new SqlCommand(query, connection);

            await connection.OpenAsync();
            await using var reader = await command.ExecuteReaderAsync();

            while (await reader.ReadAsync())
            {
                bitacoras.Add(new Bitacora
                {
                    IdBitacora = reader.GetInt64(0),
                    FechaBitacora = reader.GetDateTime(1),
                    Usuario = reader.GetInt32(2),
                    Descripcion = reader.GetString(3)
                });
            }

            return bitacoras;
        }
    }
}