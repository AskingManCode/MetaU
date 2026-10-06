using Dapper;
using Microsoft.Data.SqlClient;
using MicroservicioCursos.Entities;

namespace MicroservicioCursos.Repository
{
    public class CursoRepository : ICursoRepository
    {
        private readonly IDbConnectionFactory _conexiones;

        public CursoRepository(IDbConnectionFactory conexiones)
        {
            _conexiones = conexiones;
        }

        public async Task CrearAsync(Curso curso)
        {
            const string sql = @"
                INSERT INTO Cursos (CursoCode, CarreraCode, Nombre, Nivel)
                VALUES (@CursoCode, @CarreraCode, @Nombre, @Nivel)";

            using var conexion = _conexiones.CrearConexion();
            try
            {
                await conexion.ExecuteAsync(sql, curso);
            }
            catch (SqlException ex) when (ex.Number == 547)
            {
                throw new ArgumentException($"No existe una carrera con el identificador {curso.CarreraCode}");
            }
        }

        public async Task ModificarAsync(Curso curso)
        {
            const string sql = @"
                UPDATE Cursos
                SET Nombre = @Nombre, Nivel = @Nivel
                WHERE CursoCode = @CursoCode AND Estado = 1";

            using var conexion = _conexiones.CrearConexion();
            await conexion.ExecuteAsync(sql, curso);
        }

        public async Task EliminarAsync(string cursoCode)
        {
            const string sql = @"
                UPDATE Cursos
                SET Estado = 0
                WHERE CursoCode = @CursoCode AND Estado = 1";

            using var conexion = _conexiones.CrearConexion();
            await conexion.ExecuteAsync(sql, new { CursoCode = cursoCode });
        }

        public async Task<IEnumerable<Curso>> ObtenerTodosAsync()
        {
            const string sql = @"
                SELECT CursoCode, CarreraCode, Nombre, Nivel, Estado
                FROM Cursos
                WHERE Estado = 1";

            using var conexion = _conexiones.CrearConexion();
            return await conexion.QueryAsync<Curso>(sql);
        }

        public async Task<Curso?> ObtenerPorIdAsync(string cursoCode)
        {
            const string sql = @"
                SELECT CursoCode, CarreraCode, Nombre, Nivel, Estado
                FROM Cursos
                WHERE CursoCode = @CursoCode AND Estado = 1";

            using var conexion = _conexiones.CrearConexion();
            return await conexion.QuerySingleOrDefaultAsync<Curso>(sql, new { CursoCode = cursoCode });
        }

        public async Task<IEnumerable<Curso>> ObtenerPorCarreraAsync(string carreraCode)
        {
            const string sql = @"
                SELECT CursoCode, CarreraCode, Nombre, Nivel, Estado
                FROM Cursos
                WHERE CarreraCode = @CarreraCode AND Estado = 1";

            using var conexion = _conexiones.CrearConexion();
            return await conexion.QueryAsync<Curso>(sql, new { CarreraCode = carreraCode });
        }
    }
}