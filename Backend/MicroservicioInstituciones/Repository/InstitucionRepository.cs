using Dapper;
using MicroservicioInstituciones.Entities;

namespace MicroservicioInstituciones.Repository
{
    public class InstitucionRepository : IInstitucionRepository
    {
        private readonly IDbConnectionFactory _conexiones;

        public InstitucionRepository(IDbConnectionFactory conexiones)
        {
            _conexiones = conexiones;
        }

        // Solo instituciones activas (Estado=1) son visibles en consultas normales
        public async Task<Institucion?> ObtenerPorIdAsync(string institucionCode)
        {
            const string sql = @"
                SELECT InstitucionCode, Nombre, Estado
                FROM Instituciones
                WHERE InstitucionCode = @InstitucionCode AND Estado = 1";

            using var conexion = _conexiones.CrearConexion();
            return await conexion.QuerySingleOrDefaultAsync<Institucion>(sql, new { InstitucionCode = institucionCode });
        }

        public async Task<IEnumerable<Institucion>> ObtenerTodosAsync()
        {
            const string sql = @"
                SELECT InstitucionCode, Nombre, Estado
                FROM Instituciones
                WHERE Estado = 1";

            using var conexion = _conexiones.CrearConexion();
            return await conexion.QueryAsync<Institucion>(sql);
        }

        // Chequea existencia sin filtrar por Estado: InstitucionCode es PK unica en toda la tabla,
        // aunque este soft-deleted no se puede reusar el mismo codigo.
        public async Task<bool> ExisteAsync(string institucionCode)
        {
            const string sql = "SELECT COUNT(1) FROM Instituciones WHERE InstitucionCode = @InstitucionCode";

            using var conexion = _conexiones.CrearConexion();
            var cantidad = await conexion.ExecuteScalarAsync<int>(sql, new { InstitucionCode = institucionCode });
            return cantidad > 0;
        }

        public async Task CrearAsync(Institucion institucion)
        {
            const string sql = @"
                INSERT INTO Instituciones (InstitucionCode, Nombre)
                VALUES (@InstitucionCode, @Nombre)";

            using var conexion = _conexiones.CrearConexion();
            await conexion.ExecuteAsync(sql, institucion);
        }

        public async Task<bool> ActualizarAsync(string institucionCode, string nombre)
        {
            const string sql = @"
                UPDATE Instituciones
                SET Nombre = @Nombre
                WHERE InstitucionCode = @InstitucionCode AND Estado = 1";

            using var conexion = _conexiones.CrearConexion();
            var filas = await conexion.ExecuteAsync(sql, new { InstitucionCode = institucionCode, Nombre = nombre });
            return filas > 0;
        }

        // Eliminar = logico (Estado=0), confirmado: Carreras tiene FK a Instituciones
        public async Task<bool> EliminarAsync(string institucionCode)
        {
            const string sql = @"
                UPDATE Instituciones
                SET Estado = 0
                WHERE InstitucionCode = @InstitucionCode AND Estado = 1";

            using var conexion = _conexiones.CrearConexion();
            var filas = await conexion.ExecuteAsync(sql, new { InstitucionCode = institucionCode });
            return filas > 0;
        }
    }
}
