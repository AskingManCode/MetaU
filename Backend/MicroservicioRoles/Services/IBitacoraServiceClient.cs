namespace MicroservicioRoles.Services
{
    public interface IBitacoraServiceClient
    {
        Task RegistrarAsync(Guid usuario, string Descripcion, string token);
    }
}
