namespace MicroservicioModulos.Services.Clients
{
    public interface IBitacoraServiceClient
    {
        Task RegistrarAsync(Guid usuario, string descripcion, string token);
    }
}
