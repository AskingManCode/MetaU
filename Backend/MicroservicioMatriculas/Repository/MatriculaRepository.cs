using Microsoft.EntityFrameworkCore;
using MicroservicioMatriculas.Entities;

namespace MicroservicioMatriculas.Repository
{
    public class MatriculaRepository : IMatriculaRepository
    {
        private readonly MatriculaDbContext _db;

        public MatriculaRepository(MatriculaDbContext db)
        {
            _db = db;
        }

        public Task<Estudiante?> BuscarEstudiantePorIdentificacion(string identificacion) =>
            _db.Estudiantes.AsNoTracking()
                .FirstOrDefaultAsync(e => e.Identificacion == identificacion && e.Estado);

        public Task<int> ContarMatriculadosEnGrupo(string grupoCode) =>
            _db.MatriculasXCursos.CountAsync(c => c.GrupoCode == grupoCode && c.Estado);

        public Task<Matricula?> BuscarMatricula(Guid estudianteId, string carreraCode, Guid periodoId) =>
            _db.Matriculas.FirstOrDefaultAsync(m =>
                m.EstudianteID == estudianteId && m.CarreraCode == carreraCode && m.PeriodoID == periodoId);

        public Task<MatriculaXCurso?> BuscarCursoEnMatricula(Guid matriculaId, string cursoCode) =>
            _db.MatriculasXCursos.FirstOrDefaultAsync(c =>
                c.MatriculaID == matriculaId && c.CursoCode == cursoCode);

        public Task<MatriculaXCurso?> BuscarCursoPorId(int matriculaXCursoId) =>
            _db.MatriculasXCursos
                .Include(c => c.Matricula)
                    .ThenInclude(m => m.Estudiante)
                .FirstOrDefaultAsync(c => c.MatriculaXCursoID == matriculaXCursoId && c.Estado);

        public async Task InsertarMatricula(Matricula matricula)
        {
            _db.Matriculas.Add(matricula);
            await _db.SaveChangesAsync();
        }

        public async Task InsertarCurso(MatriculaXCurso curso)
        {
            _db.MatriculasXCursos.Add(curso);
            await _db.SaveChangesAsync();
        }

        public Task GuardarCambios() => _db.SaveChangesAsync();

        public Task<List<Estudiante>> ListarEstudiantesMatriculados(string cursoCode, string grupoCode) =>
            _db.MatriculasXCursos.AsNoTracking()
                .Where(c => c.CursoCode == cursoCode
                         && c.GrupoCode == grupoCode
                         && c.Estado
                         && c.Matricula.Estado
                         && c.Matricula.Estudiante.Estado)
                .Select(c => c.Matricula.Estudiante)
                .ToListAsync();

        public Task<List<MatriculaXCurso>> ListarCursosPorEstudiante(string identificacion) =>
    _db.MatriculasXCursos
        .AsNoTracking()
        .Include(x => x.Matricula)
            .ThenInclude(x => x.Estudiante)
        .Where(x =>
            x.Estado &&
            x.Matricula.Estado &&
            x.Matricula.Estudiante.Estado &&
            x.Matricula.Estudiante.Identificacion == identificacion)
        .ToListAsync();
    }


}