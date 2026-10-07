namespace MicroservicioListaEstudiantes.Services
{
    public class CarreraDto
    {
        public string CarreraCode { get; set; } = null!;
        public string Nombre { get; set; } = null!;
    }

    public interface ICarreraServiceClient
    {
        Task<CarreraDto?> ObtenerPorIdAsync(string id, Guid usuarioId, string token);
    }
}