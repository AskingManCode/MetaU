using System.Data;
using Dapper;
using MicroservicioPreMatriculas.Entities;

namespace MicroservicioPreMatriculas.Repository
{
    public class PrematriculaRepository : IPrematriculaRepository
    {
        private readonly IDbConnectionFactory _conexiones;

        public PrematriculaRepository(IDbConnectionFactory conexiones) => _conexiones = conexiones;

        public async Task<Estudiante?> BuscarEstudiantePorIdentificacion(string identificacion)
        {
            const string sql = """
                SELECT EstudianteID, Identificacion, NombreCompleto, Estado
                FROM Estudiantes WHERE Identificacion = @identificacion AND Estado = 1
                """;
            using var conexion = _conexiones.CrearConexion();
            return await conexion.QuerySingleOrDefaultAsync<Estudiante>(sql, new { identificacion });
        }

        public async Task<Prematricula?> BuscarPorEstudianteCarreraPeriodo(
            Guid estudianteId, string carreraCode, Guid periodoId)
        {
            const string sql = """
                SELECT TOP 1 PreMatriculaID FROM PreMatriculas
                WHERE EstudianteID = @estudianteId AND CarreraCode = @carreraCode AND PeriodoID = @periodoId
                """;
            using var conexion = _conexiones.CrearConexion();
            var id = await conexion.QuerySingleOrDefaultAsync<Guid?>(sql, new { estudianteId, carreraCode, periodoId });
            return id.HasValue ? await ObtenerPorIdInterno(conexion, id.Value, false) : null;
        }

        public async Task<Prematricula?> BuscarPorId(Guid preMatriculaId)
        {
            using var conexion = _conexiones.CrearConexion();
            return await ObtenerPorIdInterno(conexion, preMatriculaId, true);
        }

        public async Task<List<Prematricula>> ListarActivas()
        {
            using var conexion = _conexiones.CrearConexion();
            var ids = await conexion.QueryAsync<Guid>(
                "SELECT PreMatriculaID FROM PreMatriculas WHERE Estado = 1");
            var resultado = new List<Prematricula>();
            foreach (var id in ids)
            {
                var prematricula = await ObtenerPorIdInterno(conexion, id, true);
                if (prematricula is not null) resultado.Add(prematricula);
            }
            return resultado;
        }

        public async Task CrearAsync(Prematricula prematricula)
        {
            const string insertarCabecera = """
                INSERT INTO PreMatriculas (EstudianteID, CarreraCode, PeriodoID, Observaciones, Estado)
                OUTPUT INSERTED.PreMatriculaID
                VALUES (@EstudianteID, @CarreraCode, @PeriodoID, @Observaciones, @Estado)
                """;
            const string insertarCurso = """
                INSERT INTO PreMatriculasXCursos (PreMatriculaID, CursoCode, Estado)
                VALUES (@PreMatriculaID, @CursoCode, @Estado)
                """;
            using var conexion = _conexiones.CrearConexion();
            conexion.Open();
            using var transaccion = conexion.BeginTransaction();
            try
            {
                prematricula.PreMatriculaID = await conexion.QuerySingleAsync<Guid>(
                    insertarCabecera, prematricula, transaccion);
                foreach (var curso in prematricula.Cursos)
                {
                    curso.PreMatriculaID = prematricula.PreMatriculaID;
                    await conexion.ExecuteAsync(insertarCurso, curso, transaccion);
                }
                transaccion.Commit();
            }
            catch
            {
                transaccion.Rollback();
                throw;
            }
        }

        public async Task ActualizarAsync(Prematricula prematricula)
        {
            const string actualizar = """
                UPDATE PreMatriculas SET EstudianteID=@EstudianteID, CarreraCode=@CarreraCode,
                    PeriodoID=@PeriodoID, Observaciones=@Observaciones, Estado=@Estado
                WHERE PreMatriculaID=@PreMatriculaID
                """;
            const string desactivar = "UPDATE PreMatriculasXCursos SET Estado=0 WHERE PreMatriculaID=@PreMatriculaID";
            const string activar = """
                IF EXISTS (SELECT 1 FROM PreMatriculasXCursos WHERE PreMatriculaID=@PreMatriculaID AND CursoCode=@CursoCode)
                    UPDATE PreMatriculasXCursos SET Estado=1 WHERE PreMatriculaID=@PreMatriculaID AND CursoCode=@CursoCode;
                ELSE
                    INSERT INTO PreMatriculasXCursos (PreMatriculaID, CursoCode, Estado)
                    VALUES (@PreMatriculaID, @CursoCode, 1);
                """;
            using var conexion = _conexiones.CrearConexion();
            conexion.Open();
            using var transaccion = conexion.BeginTransaction();
            try
            {
                await conexion.ExecuteAsync(actualizar, prematricula, transaccion);
                await conexion.ExecuteAsync(desactivar, new { prematricula.PreMatriculaID }, transaccion);
                foreach (var curso in prematricula.Cursos.Where(c => c.Estado))
                    await conexion.ExecuteAsync(activar,
                        new { prematricula.PreMatriculaID, curso.CursoCode }, transaccion);
                transaccion.Commit();
            }
            catch
            {
                transaccion.Rollback();
                throw;
            }
        }

        public async Task EliminarAsync(Prematricula prematricula)
        {
            const string sql = """
                UPDATE PreMatriculas SET Estado=0 WHERE PreMatriculaID=@PreMatriculaID;
                UPDATE PreMatriculasXCursos SET Estado=0 WHERE PreMatriculaID=@PreMatriculaID;
                """;
            using var conexion = _conexiones.CrearConexion();
            await conexion.ExecuteAsync(sql, new { prematricula.PreMatriculaID });
            prematricula.Estado = false;
            prematricula.Cursos.ForEach(c => c.Estado = false);
        }

        private static async Task<Prematricula?> ObtenerPorIdInterno(
            IDbConnection conexion, Guid id, bool soloActiva)
        {
            const string cabecera = """
                SELECT p.PreMatriculaID, p.EstudianteID, p.CarreraCode, p.PeriodoID,
                       p.Observaciones, p.Estado,
                       e.EstudianteID AS EstudianteSeparador, e.EstudianteID,
                       e.Identificacion, e.NombreCompleto, e.Estado
                FROM PreMatriculas p INNER JOIN Estudiantes e ON e.EstudianteID=p.EstudianteID
                WHERE p.PreMatriculaID=@id AND (@soloActiva=0 OR p.Estado=1)
                """;
            const string cursos = """
                SELECT PreMatriculaXCurso AS PreMatriculaXCursoID, PreMatriculaID, CursoCode, Estado
                FROM PreMatriculasXCursos WHERE PreMatriculaID=@id
                """;
            Prematricula? resultado = null;
            await conexion.QueryAsync<Prematricula, Estudiante, Prematricula>(
                cabecera, (p, e) => { p.Estudiante = e; resultado = p; return p; },
                new { id, soloActiva }, splitOn: "EstudianteSeparador");
            if (resultado is not null)
                resultado.Cursos = (await conexion.QueryAsync<PrematriculaCurso>(cursos, new { id })).ToList();
            return resultado;
        }
    }
}
