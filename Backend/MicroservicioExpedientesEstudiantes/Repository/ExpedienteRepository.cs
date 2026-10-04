using Microsoft.EntityFrameworkCore;
using MicroservicioExpedientesEstudiantes.Entities;

namespace MicroservicioExpedientesEstudiantes.Repository
{
    public class ExpedienteRepository : IExpedienteRepository
    {
        private readonly ExpedienteDbContext _db;

        public ExpedienteRepository(ExpedienteDbContext db)
        {
            _db = db;
        }

        public async Task<Estudiante> Insertar(Estudiante estudiante)
        {
            _db.Estudiantes.Add(estudiante);
            await _db.SaveChangesAsync();
            return estudiante;
        }

        public async Task<Estudiante?> Reactivar(Estudiante estudiante)
        {
            var existente = await _db.Estudiantes
                .Include(e => e.Telefonos)
                .FirstOrDefaultAsync(e => e.Identificacion == estudiante.Identificacion && !e.Estado);

            if (existente is null) return null;

            AplicarDatos(existente, estudiante);
            existente.Estado = true;

            await _db.SaveChangesAsync();
            return existente;
        }

        public async Task<Estudiante?> Actualizar(Estudiante estudiante)
        {
            var existente = await _db.Estudiantes
                .Include(e => e.Telefonos)
                .FirstOrDefaultAsync(e => e.Identificacion == estudiante.Identificacion && e.Estado);

            if (existente is null) return null;

            AplicarDatos(existente, estudiante);

            await _db.SaveChangesAsync();
            return existente;
        }

        // Eliminación lógica: las tablas PreMatriculas y Matriculas tienen FK hacia Estudiantes,
        // por eso no se borra la fila.
        public async Task<bool> Eliminar(string identificacion)
        {
            var existente = await _db.Estudiantes
                .FirstOrDefaultAsync(e => e.Identificacion == identificacion && e.Estado);

            if (existente is null) return false;

            existente.Estado = false;
            await _db.SaveChangesAsync();
            return true;
        }

        public async Task<List<Estudiante>> ListarTodos()
        {
            return await _db.Estudiantes
                .Include(e => e.Telefonos)
                .AsNoTracking()
                .Where(e => e.Estado)
                .ToListAsync();
        }

        public async Task<Estudiante?> BuscarPorId(string identificacion)
        {
            return await _db.Estudiantes
                .Include(e => e.Telefonos)
                .AsNoTracking()
                .FirstOrDefaultAsync(e => e.Identificacion == identificacion && e.Estado);
        }

        public async Task<bool> Existe(string identificacion)
        {
            return await _db.Estudiantes.AnyAsync(e => e.Identificacion == identificacion && e.Estado);
        }

        // Incluye los eliminados: el UNIQUE del email aplica a todas las filas.
        public async Task<bool> ExisteEmail(string email, string? identificacionExcluir = null)
        {
            return await _db.Estudiantes.AnyAsync(e => e.Email == email && e.Identificacion != identificacionExcluir);
        }

        private void AplicarDatos(Estudiante existente, Estudiante nuevo)
        {
            existente.TipoIdentificacion = nuevo.TipoIdentificacion;
            existente.Email = nuevo.Email;
            existente.NombreCompleto = nuevo.NombreCompleto;
            existente.FechaNacimiento = nuevo.FechaNacimiento;

            existente.Direccion.ProvinciaID = nuevo.Direccion.ProvinciaID;
            existente.Direccion.CantonID = nuevo.Direccion.CantonID;
            existente.Direccion.DistritoID = nuevo.Direccion.DistritoID;
            existente.Direccion.OtrasSenas = nuevo.Direccion.OtrasSenas;

            _db.RemoveRange(existente.Telefonos);
            existente.Telefonos = nuevo.Telefonos
                .Select(t => new Telefono { EstudianteID = existente.EstudianteID, Numero = t.Numero })
                .ToList();
        }
    }
}
