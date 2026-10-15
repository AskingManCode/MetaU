using System.Data;
using Dapper;
using MicroservicioExpedientesEstudiantes.Entities;

namespace MicroservicioExpedientesEstudiantes.Repository
{
    public class ExpedienteRepository : IExpedienteRepository
    {
        private readonly IDbConnectionFactory _conexiones;

        public ExpedienteRepository(IDbConnectionFactory conexiones) => _conexiones = conexiones;

        public async Task<Estudiante> Insertar(Estudiante estudiante)
        {
            const string insertarEstudiante = """
                INSERT INTO Estudiantes (EstudianteID, UsuarioID, TipoIdentificacionCode, Identificacion,
                    NombreCompleto, Email, FechaNacimiento, ProvinciaID, CantonID, DistritoID, Direccion, Estado)
                VALUES (@EstudianteID, @UsuarioID, @TipoIdentificacion, @Identificacion,
                    @NombreCompleto, @Email, @FechaNacimiento, @ProvinciaID, @CantonID, @DistritoID, @OtrasSenas, @Estado)
                """;
            using var conexion = _conexiones.CrearConexion();
            conexion.Open();
            using var transaccion = conexion.BeginTransaction();
            try
            {
                await conexion.ExecuteAsync(insertarEstudiante, Parametros(estudiante), transaccion);
                await InsertarTelefonos(conexion, transaccion, estudiante);
                transaccion.Commit();
                return estudiante;
            }
            catch
            {
                transaccion.Rollback();
                throw;
            }
        }

        public async Task<Estudiante?> Reactivar(Estudiante estudiante)
        {
            using var conexion = _conexiones.CrearConexion();
            var id = await conexion.QuerySingleOrDefaultAsync<Guid?>(
                "SELECT EstudianteID FROM Estudiantes WHERE Identificacion=@Identificacion AND Estado=0",
                new { estudiante.Identificacion });
            if (!id.HasValue) return null;
            estudiante.EstudianteID = id.Value;
            estudiante.Estado = true;
            return await GuardarActualizacion(conexion, estudiante);
        }

        public async Task<Estudiante?> Actualizar(Estudiante estudiante)
        {
            using var conexion = _conexiones.CrearConexion();
            var existe = await conexion.ExecuteScalarAsync<int>(
                "SELECT COUNT(*) FROM Estudiantes WHERE Identificacion=@Identificacion AND Estado=1",
                new { estudiante.Identificacion });
            return existe == 0 ? null : await GuardarActualizacion(conexion, estudiante);
        }

        public async Task<bool> Eliminar(string identificacion)
        {
            using var conexion = _conexiones.CrearConexion();
            return await conexion.ExecuteAsync(
                "UPDATE Estudiantes SET Estado=0 WHERE Identificacion=@identificacion AND Estado=1",
                new { identificacion }) > 0;
        }

        public async Task<List<Estudiante>> ListarTodos()
        {
            using var conexion = _conexiones.CrearConexion();
            var filas = await conexion.QueryAsync<EstudianteRow>(
                $"{SeleccionEstudiante} WHERE e.Estado=1");
            var estudiantes = filas.Select(Mapear).ToList();
            foreach (var estudiante in estudiantes)
                estudiante.Telefonos = await ObtenerTelefonos(conexion, estudiante.EstudianteID);
            return estudiantes;
        }

        public async Task<Estudiante?> BuscarPorId(string identificacion)
        {
            using var conexion = _conexiones.CrearConexion();
            var fila = await conexion.QuerySingleOrDefaultAsync<EstudianteRow>(
                $"{SeleccionEstudiante} WHERE e.Identificacion=@identificacion AND e.Estado=1",
                new { identificacion });
            if (fila is null) return null;
            var estudiante = Mapear(fila);
            estudiante.Telefonos = await ObtenerTelefonos(conexion, estudiante.EstudianteID);
            return estudiante;
        }

        public async Task<bool> Existe(string identificacion)
        {
            using var conexion = _conexiones.CrearConexion();
            return await conexion.ExecuteScalarAsync<int>(
                "SELECT COUNT(*) FROM Estudiantes WHERE Identificacion=@identificacion AND Estado=1",
                new { identificacion }) > 0;
        }

        public async Task<bool> ExisteEmail(string email, string? identificacionExcluir = null)
        {
            const string sql = """
                SELECT COUNT(*) FROM Estudiantes
                WHERE Email=@email AND (@identificacionExcluir IS NULL OR Identificacion<>@identificacionExcluir)
                """;
            using var conexion = _conexiones.CrearConexion();
            return await conexion.ExecuteScalarAsync<int>(sql, new { email, identificacionExcluir }) > 0;
        }

        private static async Task<Estudiante> GuardarActualizacion(IDbConnection conexion, Estudiante estudiante)
        {
            const string actualizar = """
                UPDATE Estudiantes SET UsuarioID=@UsuarioID, TipoIdentificacionCode=@TipoIdentificacion,
                    NombreCompleto=@NombreCompleto, Email=@Email, FechaNacimiento=@FechaNacimiento,
                    ProvinciaID=@ProvinciaID, CantonID=@CantonID, DistritoID=@DistritoID,
                    Direccion=@OtrasSenas, Estado=@Estado
                WHERE EstudianteID=@EstudianteID
                """;
            conexion.Open();
            using var transaccion = conexion.BeginTransaction();
            try
            {
                await conexion.ExecuteAsync(actualizar, Parametros(estudiante), transaccion);
                await conexion.ExecuteAsync(
                    "DELETE FROM TelefonosXEstudiantes WHERE EstudianteID=@EstudianteID",
                    new { estudiante.EstudianteID }, transaccion);
                await InsertarTelefonos(conexion, transaccion, estudiante);
                transaccion.Commit();
                return estudiante;
            }
            catch
            {
                transaccion.Rollback();
                throw;
            }
        }

        private static async Task InsertarTelefonos(
            IDbConnection conexion, IDbTransaction transaccion, Estudiante estudiante)
        {
            const string sql = """
                INSERT INTO TelefonosXEstudiantes (EstudianteID, Telefono, Estado)
                VALUES (@EstudianteID, @Numero, 1)
                """;
            foreach (var telefono in estudiante.Telefonos)
            {
                telefono.EstudianteID = estudiante.EstudianteID;
                await conexion.ExecuteAsync(sql, telefono, transaccion);
            }
        }

        private static async Task<List<Telefono>> ObtenerTelefonos(IDbConnection conexion, Guid estudianteId)
        {
            const string sql = """
                SELECT TelefonoXEstudiante, EstudianteID, Telefono AS Numero
                FROM TelefonosXEstudiantes WHERE EstudianteID=@estudianteId AND Estado=1
                """;
            return (await conexion.QueryAsync<Telefono>(sql, new { estudianteId })).ToList();
        }

        private static object Parametros(Estudiante e) => new
        {
            e.EstudianteID,
            e.UsuarioID,
            e.TipoIdentificacion,
            e.Identificacion,
            e.NombreCompleto,
            e.Email,
            FechaNacimiento = e.FechaNacimiento.ToDateTime(TimeOnly.MinValue),
            e.Direccion.ProvinciaID,
            e.Direccion.CantonID,
            e.Direccion.DistritoID,
            OtrasSenas = e.Direccion.OtrasSenas,
            e.Estado
        };

        private const string SeleccionEstudiante = """
            SELECT e.EstudianteID, e.UsuarioID, e.TipoIdentificacionCode, e.Identificacion,
                   e.NombreCompleto, e.Email, e.FechaNacimiento, e.ProvinciaID,
                   e.CantonID, e.DistritoID, e.Direccion, e.Estado
            FROM Estudiantes e
            """;

        private static Estudiante Mapear(EstudianteRow fila) => new()
        {
            EstudianteID = fila.EstudianteID,
            UsuarioID = fila.UsuarioID,
            TipoIdentificacion = fila.TipoIdentificacionCode,
            Identificacion = fila.Identificacion,
            NombreCompleto = fila.NombreCompleto,
            Email = fila.Email,
            FechaNacimiento = DateOnly.FromDateTime(fila.FechaNacimiento),
            Direccion = new Direccion
            {
                ProvinciaID = fila.ProvinciaID,
                CantonID = fila.CantonID,
                DistritoID = fila.DistritoID,
                OtrasSenas = fila.Direccion
            },
            Estado = fila.Estado
        };

        private sealed class EstudianteRow
        {
            public Guid EstudianteID { get; set; }
            public Guid? UsuarioID { get; set; }
            public string TipoIdentificacionCode { get; set; } = string.Empty;
            public string Identificacion { get; set; } = string.Empty;
            public string NombreCompleto { get; set; } = string.Empty;
            public string Email { get; set; } = string.Empty;
            public DateTime FechaNacimiento { get; set; }
            public Guid ProvinciaID { get; set; }
            public Guid CantonID { get; set; }
            public Guid DistritoID { get; set; }
            public string Direccion { get; set; } = string.Empty;
            public bool Estado { get; set; }
        }
    }
}
