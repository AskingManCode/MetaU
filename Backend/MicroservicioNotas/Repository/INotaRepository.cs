using MicroservicioNotas.Entities;

namespace MicroservicioNotas.Repository
{
    public interface INotaRepository
    {
        Task ReemplazarDesglose(string grupoCode, List<Rubro> rubros);
        Task<List<Rubro>> ListarRubrosPorGrupo(string grupoCode);
        Task<Rubro?> ObtenerRubro(Guid rubroId);
        Task<bool> ExistenNotasEnGrupo(string grupoCode);
        Task<NotaRubro> InsertarNota(NotaRubro nota);
        Task<NotaRubro?> ActualizarNota(NotaRubro nota);
        Task<NotaRubro?> ObtenerNota(Guid rubroId, Guid estudianteId);
        Task<List<NotaRubro>> ListarNotas(Guid estudianteId, string grupoCode);
    }
}
