namespace MicroservicioUsuarios.Services
{
    public interface IBitacoraServiceClient
    {
        Task RegistrarAsycn(int usuario, string descripcion, string token);
    }
}
