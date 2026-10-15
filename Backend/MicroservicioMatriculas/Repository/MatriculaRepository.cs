using Dapper;
using MicroservicioMatriculas.Entities;

namespace MicroservicioMatriculas.Repository
{
    public class MatriculaRepository : IMatriculaRepository
    {
        private readonly IDbConnectionFactory _conexiones;

        public MatriculaRepository(IDbConnectionFactory conexiones) => _conexiones = conexiones;

        public async Task<Estudiante?> BuscarEstudiantePorIdentificacion(string identificacion)
        {
            const string sql = """
                SELECT EstudianteID, TipoIdentificacionCode, Identificacion, NombreCompleto, Email, Estado
                FROM Estudiantes WHERE Identificacion=@identificacion AND Estado=1
                """;
            using var conexion = _conexiones.CrearConexion();
            return await conexion.QuerySingleOrDefaultAsync<Estudiante>(sql, new { identificacion });
        }

        public async Task<int> ContarMatriculadosEnGrupo(string grupoCode)
        {
            using var conexion = _conexiones.CrearConexion();
            return await conexion.ExecuteScalarAsync<int>(
                "SELECT COUNT(*) FROM MatriculasXCursos WHERE GrupoCode=@grupoCode AND Estado=1",
                new { grupoCode });
        }

        public async Task<Matricula?> BuscarMatricula(Guid estudianteId, string carreraCode, Guid periodoId)
        {
            const string sql = """
                SELECT MatriculaID, EstudianteID, CarreraCode, PeriodoID, Estado FROM Matriculas
                WHERE EstudianteID=@estudianteId AND CarreraCode=@carreraCode AND PeriodoID=@periodoId
                """;
            using var conexion = _conexiones.CrearConexion();
            return await conexion.QuerySingleOrDefaultAsync<Matricula>(sql, new { estudianteId, carreraCode, periodoId });
        }

        public async Task<MatriculaXCurso?> BuscarCursoEnMatricula(Guid matriculaId, string cursoCode)
        {
            const string sql = """
                SELECT MatriculaXCurso AS MatriculaXCursoID, MatriculaID, CursoCode, GrupoCode, Estado
                FROM MatriculasXCursos WHERE MatriculaID=@matriculaId AND CursoCode=@cursoCode
                """;
            using var conexion = _conexiones.CrearConexion();
            return await conexion.QuerySingleOrDefaultAsync<MatriculaXCurso>(sql, new { matriculaId, cursoCode });
        }

        public async Task<MatriculaXCurso?> BuscarCursoPorId(int matriculaXCursoId)
        {
            const string sql = """
                SELECT mc.MatriculaXCurso AS MatriculaXCursoID, mc.MatriculaID, mc.CursoCode, mc.GrupoCode, mc.Estado,
                       m.MatriculaID AS MatriculaSeparador, m.MatriculaID, m.EstudianteID, m.CarreraCode, m.PeriodoID, m.Estado,
                       e.EstudianteID AS EstudianteSeparador, e.EstudianteID, e.TipoIdentificacionCode,
                       e.Identificacion, e.NombreCompleto, e.Email, e.Estado
                FROM MatriculasXCursos mc
                INNER JOIN Matriculas m ON m.MatriculaID=mc.MatriculaID
                INNER JOIN Estudiantes e ON e.EstudianteID=m.EstudianteID
                WHERE mc.MatriculaXCurso=@matriculaXCursoId AND mc.Estado=1
                """;
            using var conexion = _conexiones.CrearConexion();
            var filas = await conexion.QueryAsync<MatriculaXCurso, Matricula, Estudiante, MatriculaXCurso>(
                sql, (detalle, matricula, estudiante) =>
                {
                    matricula.Estudiante = estudiante;
                    detalle.Matricula = matricula;
                    return detalle;
                }, new { matriculaXCursoId }, splitOn: "MatriculaSeparador,EstudianteSeparador");
            return filas.SingleOrDefault();
        }

        public async Task CrearMatriculaAsync(Matricula matricula)
        {
            const string insertarMatricula = """
                INSERT INTO Matriculas (EstudianteID, CarreraCode, PeriodoID, Estado)
                OUTPUT INSERTED.MatriculaID VALUES (@EstudianteID, @CarreraCode, @PeriodoID, @Estado)
                """;
            const string insertarCurso = """
                INSERT INTO MatriculasXCursos (MatriculaID, CursoCode, GrupoCode, Estado)
                OUTPUT INSERTED.MatriculaXCurso VALUES (@MatriculaID, @CursoCode, @GrupoCode, @Estado)
                """;
            using var conexion = _conexiones.CrearConexion();
            conexion.Open();
            using var transaccion = conexion.BeginTransaction();
            try
            {
                matricula.MatriculaID = await conexion.QuerySingleAsync<Guid>(insertarMatricula, matricula, transaccion);
                foreach (var curso in matricula.Cursos)
                {
                    curso.MatriculaID = matricula.MatriculaID;
                    curso.MatriculaXCursoID = await conexion.QuerySingleAsync<int>(insertarCurso, curso, transaccion);
                }
                transaccion.Commit();
            }
            catch
            {
                transaccion.Rollback();
                throw;
            }
        }

        public async Task AgregarCursoAsync(MatriculaXCurso curso)
        {
            const string sql = """
                INSERT INTO MatriculasXCursos (MatriculaID, CursoCode, GrupoCode, Estado)
                OUTPUT INSERTED.MatriculaXCurso VALUES (@MatriculaID, @CursoCode, @GrupoCode, @Estado)
                """;
            using var conexion = _conexiones.CrearConexion();
            curso.MatriculaXCursoID = await conexion.QuerySingleAsync<int>(sql, curso);
        }

        public async Task ActualizarCursoAsync(MatriculaXCurso curso)
        {
            const string sql = """
                UPDATE MatriculasXCursos SET GrupoCode=@GrupoCode, Estado=@Estado
                WHERE MatriculaXCurso=@MatriculaXCursoID
                """;
            using var conexion = _conexiones.CrearConexion();
            await conexion.ExecuteAsync(sql, curso);
        }

        public async Task EliminarCursoAsync(MatriculaXCurso curso)
        {
            using var conexion = _conexiones.CrearConexion();
            await conexion.ExecuteAsync(
                "UPDATE MatriculasXCursos SET Estado=0 WHERE MatriculaXCurso=@MatriculaXCursoID", curso);
            curso.Estado = false;
        }

        public async Task<List<Estudiante>> ListarEstudiantesMatriculados(string cursoCode, string grupoCode)
        {
            const string sql = """
                SELECT e.EstudianteID, e.TipoIdentificacionCode, e.Identificacion, e.NombreCompleto, e.Email, e.Estado
                FROM MatriculasXCursos mc
                INNER JOIN Matriculas m ON m.MatriculaID=mc.MatriculaID
                INNER JOIN Estudiantes e ON e.EstudianteID=m.EstudianteID
                WHERE mc.CursoCode=@cursoCode AND mc.GrupoCode=@grupoCode
                  AND mc.Estado=1 AND m.Estado=1 AND e.Estado=1
                """;
            using var conexion = _conexiones.CrearConexion();
            return (await conexion.QueryAsync<Estudiante>(sql, new { cursoCode, grupoCode })).ToList();
        }

        public async Task<List<MatriculaXCurso>> ListarCursosPorEstudiante(string identificacion)
        {
            const string sql = """
                SELECT mc.MatriculaXCurso AS MatriculaXCursoID, mc.MatriculaID, mc.CursoCode, mc.GrupoCode, mc.Estado,
                       m.MatriculaID AS MatriculaSeparador, m.MatriculaID, m.EstudianteID, m.CarreraCode, m.PeriodoID, m.Estado,
                       e.EstudianteID AS EstudianteSeparador, e.EstudianteID, e.TipoIdentificacionCode,
                       e.Identificacion, e.NombreCompleto, e.Email, e.Estado
                FROM MatriculasXCursos mc
                INNER JOIN Matriculas m ON m.MatriculaID=mc.MatriculaID
                INNER JOIN Estudiantes e ON e.EstudianteID=m.EstudianteID
                WHERE mc.Estado=1 AND m.Estado=1 AND e.Estado=1 AND e.Identificacion=@identificacion
                """;
            using var conexion = _conexiones.CrearConexion();
            var filas = await conexion.QueryAsync<MatriculaXCurso, Matricula, Estudiante, MatriculaXCurso>(
                sql, (detalle, matricula, estudiante) =>
                {
                    matricula.Estudiante = estudiante;
                    detalle.Matricula = matricula;
                    return detalle;
                }, new { identificacion }, splitOn: "MatriculaSeparador,EstudianteSeparador");
            return filas.ToList();
        }
    }
}
