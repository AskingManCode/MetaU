using Microsoft.EntityFrameworkCore;
using MicroservicioLogin.Data;
using MicroservicioLogin.Entities;

namespace MicroservicioLogin.Repository
{
    public class UsuarioRepository : IUsuarioRepository
    {
        private readonly LoginDbContext _contexto;

        public UsuarioRepository(LoginDbContext contexto)
        {
            _contexto = contexto;
        }

        public async Task<Usuario?> ObtenerPorEmailAsync(string email)
        {
            return await _contexto.Usuarios
                .AsNoTracking()
                .FirstOrDefaultAsync(u => u.Email == email);
        }

        public async Task<Usuario?> ObtenerPorIdAsync(int id)
        {
            return await _contexto.Usuarios
                .AsNoTracking()
                .FirstOrDefaultAsync(u => u.Id == id);
        }
    }
}
