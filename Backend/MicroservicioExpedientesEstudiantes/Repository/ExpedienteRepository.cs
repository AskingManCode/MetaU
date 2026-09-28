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

        public async Task<Estudiante?> Actualizar(Estudiante estudiante)
        {
            var existente = await _db.Estudiantes
                .Include(e => e.Telefonos)
                .FirstOrDefaultAsync(e => e.Identificacion == estudiante.Identificacion);

            if (existente is null) return null;

            existente.TipoIdentificacion = estudiante.TipoIdentificacion;
            existente.Email = estudiante.Email;
            existente.NombreCompleto = estudiante.NombreCompleto;
            existente.FechaNacimiento = estudiante.FechaNacimiento;
            existente.Direccion = estudiante.Direccion;

            existente.Telefonos.Clear();
            foreach (var tel in estudiante.Telefonos)
            {
                existente.Telefonos.Add(new Telefono { Numero = tel.Numero, Identificacion = existente.Identificacion });
            }

            await _db.SaveChangesAsync();
            return existente;
        }

        public async Task<bool> Eliminar(string identificacion)
        {
            var existente = await _db.Estudiantes.FirstOrDefaultAsync(e => e.Identificacion == identificacion);
            if (existente is null) return false;

            _db.Estudiantes.Remove(existente);
            await _db.SaveChangesAsync();
            return true;
        }

        public async Task<List<Estudiante>> ListarTodos()
        {
            return await _db.Estudiantes.Include(e => e.Telefonos).AsNoTracking().ToListAsync();
        }

        public async Task<Estudiante?> BuscarPorId(string identificacion)
        {
            return await _db.Estudiantes
                .Include(e => e.Telefonos)
                .AsNoTracking()
                .FirstOrDefaultAsync(e => e.Identificacion == identificacion);
        }

        public async Task<bool> Existe(string identificacion)
        {
            return await _db.Estudiantes.AnyAsync(e => e.Identificacion == identificacion);
        }
    }
}
