namespace MicroservicioInstituciones.Services
{
    public interface IBitacoraServiceClient
    {
        Task RegistrarAsync(Guid usuario, string descripcion);
    }
}
