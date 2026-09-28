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
                e.ToTable("Estudiante");
                e.HasKey(x => x.Identificacion);
                e.Property(x => x.Identificacion).HasMaxLength(20);
                e.Property(x => x.TipoIdentificacion).HasMaxLength(20).IsRequired();
                e.Property(x => x.Email).HasMaxLength(150).IsRequired();
                e.Property(x => x.NombreCompleto).HasMaxLength(200).IsRequired();
                e.Property(x => x.FechaNacimiento).IsRequired();

                e.OwnsOne(x => x.Direccion, d =>
                {
                    d.Property(p => p.Provincia).HasColumnName("Provincia").HasMaxLength(100).IsRequired();
                    d.Property(p => p.Canton).HasColumnName("Canton").HasMaxLength(100).IsRequired();
                    d.Property(p => p.Distrito).HasColumnName("Distrito").HasMaxLength(100).IsRequired();
                    d.Property(p => p.OtrasSenas).HasColumnName("OtrasSenas").HasMaxLength(300).IsRequired();
                });

                e.HasMany(x => x.Telefonos)
                    .WithOne()
                    .HasForeignKey(t => t.Identificacion)
                    .OnDelete(DeleteBehavior.Cascade);
            });

            modelBuilder.Entity<Telefono>(t =>
            {
                t.ToTable("EstudianteTelefono");
                t.HasKey(x => x.IdTelefono);
                t.Property(x => x.IdTelefono).ValueGeneratedOnAdd();
                t.Property(x => x.Numero).HasMaxLength(30).IsRequired();
            });
        }
    }
}
