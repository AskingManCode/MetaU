namespace MicroservicioListaEstudiantes.Services
{
    public class CursoDto
    {
        public string Nombre { get; set; } = null!;
        public string CarreraCode { get; set; } = null!;
    }

    public interface ICursoServiceClient
    {
        Task<CursoDto?> ObtenerPorIdAsync(string id, Guid usuarioId, string token);
    }
}