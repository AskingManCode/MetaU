using Microsoft.EntityFrameworkCore;
using MicroservicioNotas.Entities;

namespace MicroservicioNotas.Repository
{
    public class NotaDbContext : DbContext
    {
        public NotaDbContext(DbContextOptions<NotaDbContext> options) : base(options) { }

        public DbSet<Rubro> Rubros => Set<Rubro>();
        public DbSet<NotaRubro> NotasXEstudiante => Set<NotaRubro>();

        protected override void OnModelCreating(ModelBuilder modelBuilder)
        {
            modelBuilder.Entity<Rubro>(r =>
            {
                r.ToTable("Rubros");
                r.HasKey(x => x.RubroID);
                r.Property(x => x.RubroID).HasDefaultValueSql("NEWSEQUENTIALID()").ValueGeneratedOnAdd();
                r.Property(x => x.GrupoCode).HasMaxLength(15).IsRequired();
                r.Property(x => x.NombreRubro).HasMaxLength(100).IsRequired();
                r.Property(x => x.Porcentaje).HasColumnType("decimal(5,2)");
                r.Property(x => x.Bloqueado).HasDefaultValue(true);
                r.Property(x => x.Estado).HasDefaultValue(true);
                r.HasIndex(x => new { x.GrupoCode, x.NombreRubro }).IsUnique();
            });

            modelBuilder.Entity<NotaRubro>(n =>
            {
                n.ToTable("NotasXEstudiante");
                n.HasKey(x => x.NotaXEstudianteID);
                n.Property(x => x.NotaXEstudianteID).ValueGeneratedOnAdd();
                n.Property(x => x.Nota).HasColumnType("decimal(5,2)");
                n.Property(x => x.FechaRegistro)
                    .HasColumnType("date")
                    .HasDefaultValueSql("CAST(GETDATE() AS DATE)")
                    .ValueGeneratedOnAdd();
                n.HasIndex(x => new { x.RubroID, x.EstudianteID }).IsUnique();

                n.HasOne<Rubro>()
                    .WithMany()
                    .HasForeignKey(x => x.RubroID);
            });
        }
    }
}
