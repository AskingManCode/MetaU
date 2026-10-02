using Microsoft.EntityFrameworkCore;
using MicroservicioExpedientesEstudiantes.Entities;

namespace MicroservicioExpedientesEstudiantes.Repository
{
    public class ExpedienteDbContext : DbContext
    {
        public ExpedienteDbContext(DbContextOptions<ExpedienteDbContext> options) : base(options) { }

        public DbSet<Estudiante> Estudiantes => Set<Estudiante>();

        protected override void OnModelCreating(ModelBuilder modelBuilder)
        {
            modelBuilder.Entity<Estudiante>(e =>
            {
                e.ToTable("Estudiantes");
                e.HasKey(x => x.EstudianteID);
                e.Property(x => x.EstudianteID).HasDefaultValueSql("NEWSEQUENTIALID()").ValueGeneratedOnAdd();
                e.Property(x => x.Identificacion).HasMaxLength(30).IsRequired();
                e.Property(x => x.TipoIdentificacion).HasMaxLength(15).IsRequired();
                e.Property(x => x.Email).HasMaxLength(150).IsRequired();
                e.Property(x => x.NombreCompleto).HasMaxLength(175).IsRequired();
                e.Property(x => x.Estado).HasDefaultValue(true);

                e.HasIndex(x => x.Identificacion).IsUnique();
                e.HasIndex(x => x.Email).IsUnique();

                e.OwnsOne(x => x.Direccion, d =>
                {
                    d.Property(p => p.ProvinciaID).HasColumnName("ProvinciaID").IsRequired();
                    d.Property(p => p.CantonID).HasColumnName("CantonID").IsRequired();
                    d.Property(p => p.DistritoID).HasColumnName("DistritoID").IsRequired();
                    d.Property(p => p.OtrasSenas).HasColumnName("Direccion").HasMaxLength(250).IsRequired();
                });

                e.HasMany(x => x.Telefonos)
                    .WithOne()
                    .HasForeignKey(t => t.EstudianteID)
                    .OnDelete(DeleteBehavior.Cascade);
            });

            modelBuilder.Entity<Telefono>(t =>
            {
                t.ToTable("TelefonosXEstudiantes");
                t.HasKey(x => x.TelefonoXEstudiante);
                t.Property(x => x.TelefonoXEstudiante).ValueGeneratedOnAdd();
                t.Property(x => x.Numero).HasColumnName("Telefono").HasMaxLength(25).IsRequired();
                t.HasIndex(x => new { x.EstudianteID, x.Numero }).IsUnique();
            });
        }
    }
}
