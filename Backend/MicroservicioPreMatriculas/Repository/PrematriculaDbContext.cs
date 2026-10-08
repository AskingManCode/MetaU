using Microsoft.EntityFrameworkCore;
using MicroservicioPreMatriculas.Entities;

namespace MicroservicioPreMatriculas.Repository
{
    public class PrematriculaDbContext : DbContext
    {
        public PrematriculaDbContext(DbContextOptions<PrematriculaDbContext> options) : base(options) { }

        public DbSet<Estudiante> Estudiantes => Set<Estudiante>();
        public DbSet<Prematricula> Prematriculas => Set<Prematricula>();
        public DbSet<PrematriculaCurso> PrematriculasCursos => Set<PrematriculaCurso>();

        protected override void OnModelCreating(ModelBuilder modelBuilder)
        {
            modelBuilder.Entity<Estudiante>(e =>
            {
                e.ToTable("Estudiantes");
                e.HasKey(x => x.EstudianteID);
                e.Property(x => x.EstudianteID).ValueGeneratedNever();
                e.Property(x => x.Identificacion).HasMaxLength(30).IsRequired();
                e.Property(x => x.NombreCompleto).HasMaxLength(175).IsRequired();
            });

            modelBuilder.Entity<Prematricula>(p =>
            {
                p.ToTable("PreMatriculas");
                p.HasKey(x => x.PreMatriculaID);
                p.Property(x => x.PreMatriculaID).HasDefaultValueSql("NEWSEQUENTIALID()").ValueGeneratedOnAdd();
                p.Property(x => x.CarreraCode).HasMaxLength(15).IsRequired();
                p.Property(x => x.Observaciones).HasMaxLength(300);

                p.HasOne(x => x.Estudiante)
                    .WithMany()
                    .HasForeignKey(x => x.EstudianteID);

                p.HasMany(x => x.Cursos)
                    .WithOne(c => c.Prematricula)
                    .HasForeignKey(c => c.PreMatriculaID);
            });

            modelBuilder.Entity<PrematriculaCurso>(c =>
            {
                c.ToTable("PreMatriculasXCursos");
                c.HasKey(x => x.PreMatriculaXCursoID);
                c.Property(x => x.PreMatriculaXCursoID).HasColumnName("PreMatriculaXCurso").ValueGeneratedOnAdd();
                c.Property(x => x.CursoCode).HasMaxLength(15).IsRequired();
            });
        }
    }
}
