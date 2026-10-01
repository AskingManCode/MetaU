namespace MicroservicioProfesores.Services
{
    public interface IBitacoraServiceClient
    {
        Task RegistrarAsync(int usuario, string descripcion, string token);
    }
}