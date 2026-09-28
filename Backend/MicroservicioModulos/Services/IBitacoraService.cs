namespace MicroservicioModulos.Services
{
    public interface IBitacoraService
    {
        Task RegistrarAsync(string usuario, string descripcion);
    }
}
