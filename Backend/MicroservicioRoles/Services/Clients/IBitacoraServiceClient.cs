namespace MicroservicioRoles.Services.Clients
{
    public interface IBitacoraServiceClient
    {
        Task RegistrarAsync(Guid usuario, string Descripcion, string token);
    }
}
