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

        public async Task<Rubro?> ObtenerRubro(int idRubro)
        {
            return await _db.Rubros.AsNoTracking().FirstOrDefaultAsync(r => r.IdRubro == idRubro);
        }

        public async Task<bool> ExistenNotasEnGrupo(string grupoCode)
        {
            return await _db.Notas
                .Join(_db.Rubros, n => n.IdRubro, r => r.IdRubro, (n, r) => r)
                .AnyAsync(r => r.GrupoCode == grupoCode);
        }

        public async Task<NotaRubro> InsertarNota(NotaRubro nota)
        {
            _db.Notas.Add(nota);
            await _db.SaveChangesAsync();
            return nota;
        }

        public async Task<NotaRubro?> ActualizarNota(NotaRubro nota)
        {
            var existente = await _db.Notas
                .FirstOrDefaultAsync(n => n.IdRubro == nota.IdRubro && n.Identificacion == nota.Identificacion);

            if (existente is null) return null;

            existente.Nota = nota.Nota;
            await _db.SaveChangesAsync();
            return existente;
        }

        public async Task<NotaRubro?> ObtenerNota(int idRubro, string identificacion)
        {
            return await _db.Notas.AsNoTracking()
                .FirstOrDefaultAsync(n => n.IdRubro == idRubro && n.Identificacion == identificacion);
        }

        public async Task<List<NotaRubro>> ListarNotas(string identificacion, string cursoCode)
        {
            return await _db.Notas
                .Join(_db.Rubros, n => n.IdRubro, r => r.IdRubro, (n, r) => new { Nota = n, Rubro = r })
                .Where(x => x.Nota.Identificacion == identificacion && x.Rubro.CursoCode == cursoCode)
                .Select(x => x.Nota)
                .AsNoTracking()
                .ToListAsync();
        }
    }
}
