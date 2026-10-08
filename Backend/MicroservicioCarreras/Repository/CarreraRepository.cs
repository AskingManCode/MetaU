using Dapper;
using Microsoft.Data.SqlClient;
using MicroservicioCarreras.Entities;

namespace MicroservicioCarreras.Repository
{
    public class CarreraRepository : ICarreraRepository
    {
        private readonly IDbConnectionFactory _conexiones;

        public CarreraRepository(IDbConnectionFactory conexiones)
        {
            _conexiones = conexiones;
        }

        public async Task<Carrera?> ObtenerPorIdAsync(string carreraCode)
        {
            const string sql = @"
                SELECT CarreraCode, InstitucionCode, DirectorID, Nombre, Estado
                FROM Carreras
                WHERE CarreraCode = @CarreraCode AND Estado = 1";

            using var conexion = _conexiones.CrearConexion();
            return await conexion.QuerySingleOrDefaultAsync<Carrera>(sql, new { CarreraCode = carreraCode });
        }

        public async Task<IEnumerable<Carrera>> ObtenerTodosAsync()
        {
            const string sql = @"
                SELECT CarreraCode, InstitucionCode, DirectorID, Nombre, Estado
                FROM Carreras
                WHERE Estado = 1";

            using var conexion = _conexiones.CrearConexion();
            return await conexion.QueryAsync<Carrera>(sql);
        }

        public async Task<IEnumerable<Carrera>> ObtenerPorInstitucionAsync(string institucionCode)
        {
            const string sql = @"
                SELECT CarreraCode, InstitucionCode, DirectorID, Nombre, Estado
                FROM Carreras
                WHERE InstitucionCode = @InstitucionCode AND Estado = 1";

            using var conexion = _conexiones.CrearConexion();
            return await conexion.QueryAsync<Carrera>(sql, new { InstitucionCode = institucionCode });
        }

        public async Task<bool> ExisteAsync(string carreraCode)
        {
            const string sql = "SELECT COUNT(1) FROM Carreras WHERE CarreraCode = @CarreraCode";

            using var conexion = _conexiones.CrearConexion();
            var cantidad = await conexion.ExecuteScalarAsync<int>(sql, new { CarreraCode = carreraCode });
            return cantidad > 0;
        }

        public async Task CrearAsync(Carrera carrera)
        {
            const string sql = @"
                INSERT INTO Carreras (CarreraCode, InstitucionCode, DirectorID, Nombre)
                VALUES (@CarreraCode, @InstitucionCode, @DirectorID, @Nombre)";

            using var conexion = _conexiones.CrearConexion();
            try
            {
                await conexion.ExecuteAsync(sql, carrera);
            }
            catch (SqlException ex) when (ex.Number == 547)
            {
                throw TraducirErrorFk(ex, carrera.InstitucionCode, carrera.DirectorID);
            }
        }

        public async Task<bool> ActualizarAsync(string carreraCode, string nombre, Guid directorId)
        {
            const string sql = @"
                UPDATE Carreras
                SET Nombre = @Nombre, DirectorID = @DirectorID
                WHERE CarreraCode = @CarreraCode AND Estado = 1";

            using var conexion = _conexiones.CrearConexion();
            try
            {
                var filas = await conexion.ExecuteAsync(sql, new { CarreraCode = carreraCode, Nombre = nombre, DirectorID = directorId });
                return filas > 0;
            }
            catch (SqlException ex) when (ex.Number == 547)
            {
                throw TraducirErrorFk(ex, institucionCode: null, directorId);
            }
        }

        // Eliminar = logico (Estado=0), mismo patron que Instituciones (ACD1)
        public async Task<bool> EliminarAsync(string carreraCode)
        {
            const string sql = @"
                UPDATE Carreras
                SET Estado = 0
                WHERE CarreraCode = @CarreraCode AND Estado = 1";

            using var conexion = _conexiones.CrearConexion();
            var filas = await conexion.ExecuteAsync(sql, new { CarreraCode = carreraCode });
            return filas > 0;
        }

        // Instituciones, Carreras y Profesores viven en la misma BD (Oferta_Academica_DB),
        // asi que las FK reales de SQL Server ya validan que InstitucionCode y DirectorID
        // existan. Aca solo se traduce el error 547 (FK violation) a un mensaje legible.
        private static ArgumentException TraducirErrorFk(SqlException ex, string? institucionCode, Guid directorId)
        {
            if (ex.Message.Contains("FK_Carreras_Institucion"))
                return new ArgumentException($"No existe una institucion con el identificador {institucionCode}");

            if (ex.Message.Contains("FK_Carreras_Director"))
                return new ArgumentException($"El director {directorId} no esta registrado como profesor");

            return new ArgumentException("No se pudo guardar la carrera: hay una referencia invalida");
        }
    }
}
