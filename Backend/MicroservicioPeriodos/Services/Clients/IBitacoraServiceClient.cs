namespace MicroservicioPeriodos.Services
{
    public interface IBitacoraServiceClient
    {
        Task RegistrarAsync(Guid usuario, string descripcion, string token);
    }
}