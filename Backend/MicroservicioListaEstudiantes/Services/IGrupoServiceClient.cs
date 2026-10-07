namespace MicroservicioListaEstudiantes.Services
{
    public class GrupoDto
    {
        public string GrupoCode { get; set; } = null!;
        public byte NumeroGrupo { get; set; }
        public string CursoCode { get; set; } = null!;
        public Guid PeriodoID { get; set; }
    }

    public interface IGrupoServiceClient
    {
        Task<IEnumerable<GrupoDto>> ObtenerTodosAsync(Guid usuarioId, string token);
    }
}