using Microsoft.EntityFrameworkCore;
using MicroservicioLogin.Entities;

namespace MicroservicioLogin.Data
{
    public class LoginDbContext : DbContext
    {
        public LoginDbContext(DbContextOptions<LoginDbContext> options) : base(options) { }

        public DbSet<Usuario> Usuarios => Set<Usuario>();
        public DbSet<RefreshToken> RefreshTokens => Set<RefreshToken>();

        protected override void OnModelCreating(ModelBuilder modelBuilder)
        {
            // Únicas columnas IDENTITY del microservicio: las llaves primarias.
            // Todo lo demás se llena explícitamente desde el código, nunca autogenerado.
            modelBuilder.Entity<Usuario>(entity =>
            {
                entity.ToTable("Usuario");
                entity.HasKey(u => u.Id);
                entity.Property(u => u.Id).UseIdentityColumn();
                entity.Property(u => u.Email).IsRequired().HasMaxLength(150);
                entity.Property(u => u.ContrasenaHash).IsRequired();
                entity.Property(u => u.Rol).IsRequired().HasMaxLength(50);
                entity.HasIndex(u => u.Email).IsUnique();
            });

            modelBuilder.Entity<RefreshToken>(entity =>
            {
                entity.ToTable("RefreshToken");
                entity.HasKey(rt => rt.Id);
                entity.Property(rt => rt.Id).UseIdentityColumn();
                entity.Property(rt => rt.Token).IsRequired();
                entity.HasIndex(rt => rt.Token).IsUnique();
            });
        }
    }
}
