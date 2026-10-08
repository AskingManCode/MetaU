namespace MicroservicioPagos.Services.Clients
{
    public interface IBitacoraServiceClient
    {
        Task RegistrarBitacoraAsync(Guid usuario, string descripcion, string token);
    }
}
