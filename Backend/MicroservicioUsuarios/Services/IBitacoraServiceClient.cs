namespace MicroservicioUsuarios.Services
{
    public interface IBitacoraServiceClient
    {
        Task RegistrarAsycn(Guid usuario, string descripcion, string token);
    }
}
