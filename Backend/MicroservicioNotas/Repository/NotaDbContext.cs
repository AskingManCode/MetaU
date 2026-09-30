using Microsoft.EntityFrameworkCore;
using MicroservicioNotas.Entities;

namespace MicroservicioNotas.Repository
{
    public class NotaDbContext : DbContext
    {
        public NotaDbContext(DbContextOptions<NotaDbContext> options) : base(options) { }

        public DbSet<Rubro> Rubros => Set<Rubro>();
        public DbSet<NotaRubro> Notas => Set<NotaRubro>();

        protected override void OnModelCreating(ModelBuilder modelBuilder)
        {
            modelBuilder.Entity<Rubro>(r =>
            {
                r.ToTable("Rubro");
                r.HasKey(x => x.IdRubro);
                r.Property(x => x.IdRubro).ValueGeneratedOnAdd();
                r.Property(x => x.GrupoCode).HasMaxLength(15).IsRequired();
                r.Property(x => x.CursoCode).HasMaxLength(15).IsRequired();
                r.Property(x => x.Nombre).HasMaxLength(150).IsRequired();
                r.Property(x => x.Porcentaje).HasColumnType("decimal(5,2)");
            });

            modelBuilder.Entity<NotaRubro>(n =>
            {
                n.ToTable("NotaRubro");
                n.HasKey(x => x.IdNota);
                n.Property(x => x.IdNota).ValueGeneratedOnAdd();
                n.Property(x => x.Identificacion).HasMaxLength(20).IsRequired();
                n.Property(x => x.Nota).HasColumnType("decimal(5,2)");

                n.HasOne<Rubro>()
                    .WithMany()
                    .HasForeignKey(x => x.IdRubro);
            });
        }
    }
}
