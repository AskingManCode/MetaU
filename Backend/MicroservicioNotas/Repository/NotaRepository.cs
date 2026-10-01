using Microsoft.EntityFrameworkCore;
using MicroservicioNotas.Entities;

namespace MicroservicioNotas.Repository
{
    public class NotaRepository : INotaRepository
    {
        private readonly NotaDbContext _db;

        public NotaRepository(NotaDbContext db)
        {
            _db = db;
        }

        public async Task ReemplazarDesglose(string grupoCode, List<Rubro> rubros)
        {
            var anteriores = await _db.Rubros.Where(r => r.GrupoCode == grupoCode).ToListAsync();
            _db.Rubros.RemoveRange(anteriores);
            await _db.Rubros.AddRangeAsync(rubros);
            await _db.SaveChangesAsync();
        }

        public async Task<List<Rubro>> ListarRubrosPorGrupo(string grupoCode)
        {
            return await _db.Rubros.Where(r => r.GrupoCode == grupoCode).AsNoTracking().ToListAsync();
        }

        public async Task<Rubro?> ObtenerRubro(Guid rubroId)
        {
            return await _db.Rubros.AsNoTracking().FirstOrDefaultAsync(r => r.RubroID == rubroId);
        }

        public async Task<bool> ExistenNotasEnGrupo(string grupoCode)
        {
            return await _db.NotasXEstudiante
                .Join(_db.Rubros, n => n.RubroID, r => r.RubroID, (n, r) => r)
                .AnyAsync(r => r.GrupoCode == grupoCode);
        }

        public async Task<NotaRubro> InsertarNota(NotaRubro nota)
        {
            _db.NotasXEstudiante.Add(nota);
            await _db.SaveChangesAsync();
            return nota;
        }

        public async Task<NotaRubro?> ActualizarNota(NotaRubro nota)
        {
            var existente = await _db.NotasXEstudiante
                .FirstOrDefaultAsync(n => n.RubroID == nota.RubroID && n.EstudianteID == nota.EstudianteID);

            if (existente is null) return null;

            existente.Nota = nota.Nota;
            await _db.SaveChangesAsync();
            return existente;
        }

        public async Task<NotaRubro?> ObtenerNota(Guid rubroId, Guid estudianteId)
        {
            return await _db.NotasXEstudiante.AsNoTracking()
                .FirstOrDefaultAsync(n => n.RubroID == rubroId && n.EstudianteID == estudianteId);
        }

        public async Task<List<NotaRubro>> ListarNotas(Guid estudianteId, string grupoCode)
        {
            return await _db.NotasXEstudiante
                .Join(_db.Rubros, n => n.RubroID, r => r.RubroID, (n, r) => new { Nota = n, Rubro = r })
                .Where(x => x.Nota.EstudianteID == estudianteId && x.Rubro.GrupoCode == grupoCode)
                .Select(x => x.Nota)
                .AsNoTracking()
                .ToListAsync();
        }
    }
}
