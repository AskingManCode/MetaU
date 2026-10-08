using System;
using System.Threading.Tasks;

namespace MicroservicioFacturacion.Services.Clients
{
    public interface IBitacoraServiceClient
    {
        Task RegistrarBitacoraAsync(Guid usuario, string descripcion, string token);
    }
}
