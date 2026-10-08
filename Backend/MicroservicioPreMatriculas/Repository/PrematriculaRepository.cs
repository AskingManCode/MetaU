using Microsoft.EntityFrameworkCore;
using MicroservicioPreMatriculas.Entities;

namespace MicroservicioPreMatriculas.Repository
{
    public class PrematriculaRepository : IPrematriculaRepository
    {
        private readonly PrematriculaDbContext _db;

        public PrematriculaRepository(PrematriculaDbContext db)
        {
            _db = db;
        }

        public Task<Estudiante?> BuscarEstudiantePorIdentificacion(string identificacion) =>
            _db.Estudiantes.FirstOrDefaultAsync(e => e.Identificacion == identificacion && e.Estado);

        public Task<Prematricula?> BuscarPorEstudianteCarreraPeriodo(Guid estudianteId, string carreraCode, Guid periodoId) =>
            _db.Prematriculas
                .Include(p => p.Estudiante)
                .Include(p => p.Cursos)
                .FirstOrDefaultAsync(p =>
                    p.EstudianteID == estudianteId && p.CarreraCode == carreraCode && p.PeriodoID == periodoId);

        public Task<Prematricula?> BuscarPorId(Guid preMatriculaId) =>
            _db.Prematriculas
                .Include(p => p.Estudiante)
                .Include(p => p.Cursos)
                .FirstOrDefaultAsync(p => p.PreMatriculaID == preMatriculaId && p.Estado);

        public Task<List<Prematricula>> ListarActivas() =>
            _db.Prematriculas.AsNoTracking()
                .Include(p => p.Estudiante)
                .Include(p => p.Cursos)
                .Where(p => p.Estado)
                .ToListAsync();

        public async Task Insertar(Prematricula prematricula)
        {
            _db.Prematriculas.Add(prematricula);
            await _db.SaveChangesAsync();
        }

        public Task GuardarCambios() => _db.SaveChangesAsync();
    }
}
