using MicroservicioHistorialAcademico.Entities;

namespace MicroservicioHistorialAcademico.Services
{
    public interface IHistorialAcademicoService
    {
        Task<IEnumerable<HistorialAcademico>> ObtenerAsync(string tipoIdentificacion, string identificacion, Guid usuario, string token);
    }
}