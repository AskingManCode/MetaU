namespace MicroservicioUsuarios.Services.Clients
{
    public interface IBitacoraServiceClient
    {
        Task RegistrarAsycn(Guid usuario, string descripcion, string token);
    }
}
