using System.Data;
using Dapper;
using MicroservicioNotas.Entities;

namespace MicroservicioNotas.Repository
{
    public class NotaRepository : INotaRepository
    {
        private readonly IDbConnectionFactory _conexiones;

        public NotaRepository(IDbConnectionFactory conexiones) => _conexiones = conexiones;

        public async Task ReemplazarDesglose(string grupoCode, List<Rubro> rubros)
        {
            const string eliminar = "DELETE FROM Rubros WHERE GrupoCode=@grupoCode";
            const string insertar = """
                INSERT INTO Rubros (GrupoCode, NombreRubro, Porcentaje, Bloqueado, Estado)
                OUTPUT INSERTED.RubroID
                VALUES (@GrupoCode, @NombreRubro, @Porcentaje, @Bloqueado, @Estado)
                """;
            using var conexion = _conexiones.CrearConexion();
            conexion.Open();
            using var transaccion = conexion.BeginTransaction();
            try
            {
                await conexion.ExecuteAsync(eliminar, new { grupoCode }, transaccion);
                foreach (var rubro in rubros)
                    rubro.RubroID = await conexion.QuerySingleAsync<Guid>(insertar, rubro, transaccion);
                transaccion.Commit();
            }
            catch
            {
                transaccion.Rollback();
                throw;
            }
        }

        public async Task<List<Rubro>> ListarRubrosPorGrupo(string grupoCode)
        {
            const string sql = """
                SELECT RubroID, GrupoCode, NombreRubro, Porcentaje, Bloqueado, Estado
                FROM Rubros WHERE GrupoCode=@grupoCode
                """;
            using var conexion = _conexiones.CrearConexion();
            return (await conexion.QueryAsync<Rubro>(sql, new { grupoCode })).ToList();
        }

        public async Task<Rubro?> ObtenerRubro(Guid rubroId)
        {
            const string sql = """
                SELECT RubroID, GrupoCode, NombreRubro, Porcentaje, Bloqueado, Estado
                FROM Rubros WHERE RubroID=@rubroId
                """;
            using var conexion = _conexiones.CrearConexion();
            return await conexion.QuerySingleOrDefaultAsync<Rubro>(sql, new { rubroId });
        }

        public async Task<bool> ExistenNotasEnGrupo(string grupoCode)
        {
            const string sql = """
                SELECT COUNT(*) FROM NotasXEstudiante n
                INNER JOIN Rubros r ON r.RubroID=n.RubroID
                WHERE r.GrupoCode=@grupoCode
                """;
            using var conexion = _conexiones.CrearConexion();
            return await conexion.ExecuteScalarAsync<int>(sql, new { grupoCode }) > 0;
        }

        public async Task<NotaRubro> InsertarNota(NotaRubro nota)
        {
            const string sql = """
                INSERT INTO NotasXEstudiante (RubroID, EstudianteID, Nota)
                OUTPUT INSERTED.NotaXEstudianteID, INSERTED.FechaRegistro
                VALUES (@RubroID, @EstudianteID, @Nota)
                """;
            using var conexion = _conexiones.CrearConexion();
            var creada = await conexion.QuerySingleAsync<NotaCreada>(sql, nota);
            nota.NotaXEstudianteID = creada.NotaXEstudianteID;
            nota.FechaRegistro = DateOnly.FromDateTime(creada.FechaRegistro);
            return nota;
        }

        public async Task<NotaRubro?> ActualizarNota(NotaRubro nota)
        {
            const string actualizar = """
                UPDATE NotasXEstudiante SET Nota=@Nota
                WHERE RubroID=@RubroID AND EstudianteID=@EstudianteID
                """;
            using var conexion = _conexiones.CrearConexion();
            return await conexion.ExecuteAsync(actualizar, nota) == 0
                ? null
                : await ObtenerNotaConConexion(conexion, nota.RubroID, nota.EstudianteID);
        }

        public async Task<NotaRubro?> ObtenerNota(Guid rubroId, Guid estudianteId)
        {
            using var conexion = _conexiones.CrearConexion();
            return await ObtenerNotaConConexion(conexion, rubroId, estudianteId);
        }

        public async Task<List<NotaRubro>> ListarNotas(Guid estudianteId, string grupoCode)
        {
            const string sql = """
                SELECT n.NotaXEstudianteID, n.RubroID, n.EstudianteID, n.Nota, n.FechaRegistro
                FROM NotasXEstudiante n INNER JOIN Rubros r ON r.RubroID=n.RubroID
                WHERE n.EstudianteID=@estudianteId AND r.GrupoCode=@grupoCode
                """;
            using var conexion = _conexiones.CrearConexion();
            var filas = await conexion.QueryAsync<NotaRow>(sql, new { estudianteId, grupoCode });
            return filas.Select(Mapear).ToList();
        }

        private static async Task<NotaRubro?> ObtenerNotaConConexion(
            IDbConnection conexion, Guid rubroId, Guid estudianteId)
        {
            const string sql = """
                SELECT NotaXEstudianteID, RubroID, EstudianteID, Nota, FechaRegistro
                FROM NotasXEstudiante WHERE RubroID=@rubroId AND EstudianteID=@estudianteId
                """;
            var fila = await conexion.QuerySingleOrDefaultAsync<NotaRow>(sql, new { rubroId, estudianteId });
            return fila is null ? null : Mapear(fila);
        }

        private static NotaRubro Mapear(NotaRow fila) => new()
        {
            NotaXEstudianteID = fila.NotaXEstudianteID,
            RubroID = fila.RubroID,
            EstudianteID = fila.EstudianteID,
            Nota = fila.Nota,
            FechaRegistro = DateOnly.FromDateTime(fila.FechaRegistro)
        };

        private sealed class NotaRow
        {
            public int NotaXEstudianteID { get; set; }
            public Guid RubroID { get; set; }
            public Guid EstudianteID { get; set; }
            public decimal Nota { get; set; }
            public DateTime FechaRegistro { get; set; }
        }

        private sealed class NotaCreada
        {
            public int NotaXEstudianteID { get; set; }
            public DateTime FechaRegistro { get; set; }
        }
    }
}
