namespace MicroservicioUsuarios.Services
{
    public class RolDto
    {
        public string IdRol { get; set; } = null!;
        public string Nombre { get; set; } = null!;
    }

    public interface IRolServiceClient
    {
        Task<RolDto?> ObtenerPorIdAsync(string idRol, Guid usuarioId, string token);
    }
}