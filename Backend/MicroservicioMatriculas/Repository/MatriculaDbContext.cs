using Microsoft.EntityFrameworkCore;
using MicroservicioMatriculas.Entities;

namespace MicroservicioMatriculas.Repository
{
    public class MatriculaDbContext : DbContext
    {
        public MatriculaDbContext(DbContextOptions<MatriculaDbContext> options) : base(options) { }

        public DbSet<Estudiante> Estudiantes => Set<Estudiante>();
        public DbSet<Matricula> Matriculas => Set<Matricula>();
        public DbSet<MatriculaXCurso> MatriculasXCursos => Set<MatriculaXCurso>();

        protected override void OnModelCreating(ModelBuilder modelBuilder)
        {
            modelBuilder.Entity<Estudiante>(e =>
            {
                e.ToTable("Estudiantes");
                e.HasKey(x => x.EstudianteID);
                e.Property(x => x.EstudianteID).ValueGeneratedNever();
                e.Property(x => x.TipoIdentificacionCode).HasMaxLength(15).IsRequired();
                e.Property(x => x.Identificacion).HasMaxLength(30).IsRequired();
                e.Property(x => x.NombreCompleto).HasMaxLength(175).IsRequired();
                e.Property(x => x.Email).HasMaxLength(150).IsRequired();
            });

            modelBuilder.Entity<Matricula>(m =>
            {
                m.ToTable("Matriculas");
                m.HasKey(x => x.MatriculaID);
                m.Property(x => x.MatriculaID).HasDefaultValueSql("NEWSEQUENTIALID()").ValueGeneratedOnAdd();
                m.Property(x => x.CarreraCode).HasMaxLength(15).IsRequired();

                m.HasOne(x => x.Estudiante)
                    .WithMany()
                    .HasForeignKey(x => x.EstudianteID);

                m.HasMany(x => x.Cursos)
                    .WithOne(c => c.Matricula)
                    .HasForeignKey(c => c.MatriculaID);
            });

            modelBuilder.Entity<MatriculaXCurso>(c =>
            {
                c.ToTable("MatriculasXCursos");
                c.HasKey(x => x.MatriculaXCursoID);
                c.Property(x => x.MatriculaXCursoID).HasColumnName("MatriculaXCurso").ValueGeneratedOnAdd();
                c.Property(x => x.CursoCode).HasMaxLength(15).IsRequired();
                c.Property(x => x.GrupoCode).HasMaxLength(15).IsRequired();
            });
        }
    }
}
