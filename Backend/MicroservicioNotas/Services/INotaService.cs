using MicroservicioNotas.Entities;

namespace MicroservicioNotas.Services
{
    public interface INotaService
    {
        Task<List<Rubro>> CargarDesglose(DesgloseRequest request, ContextoUsuario contexto);
        Task<NotaRubro> AsignarNotaRubro(NotaRubroRequest request, ContextoUsuario contexto);
        Task<NotaRubro> ModificarNotaRubro(NotaRubroRequest request, ContextoUsuario contexto);
        Task<List<Rubro>> ObtenerDesglose(string grupoCode, ContextoUsuario contexto);
        Task<List<NotaRubro>> ObtenerNotas(string identificacion, string cursoCode, ContextoUsuario contexto);
    }
}
