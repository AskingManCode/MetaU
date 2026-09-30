using MicroservicioNotas.Entities;

namespace MicroservicioNotas.Repository
{
    public interface INotaRepository
    {
        Task ReemplazarDesglose(string grupoCode, List<Rubro> rubros);
        Task<List<Rubro>> ListarRubrosPorGrupo(string grupoCode);
        Task<Rubro?> ObtenerRubro(int idRubro);
        Task<bool> ExistenNotasEnGrupo(string grupoCode);
        Task<NotaRubro> InsertarNota(NotaRubro nota);
        Task<NotaRubro?> ActualizarNota(NotaRubro nota);
        Task<NotaRubro?> ObtenerNota(int idRubro, string identificacion);
        Task<List<NotaRubro>> ListarNotas(string identificacion, string cursoCode);
    }
}
