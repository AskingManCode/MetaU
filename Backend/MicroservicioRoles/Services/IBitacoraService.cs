namespace MicroservicioRoles.Services
{
    public interface IBitacoraService
    {
        Task RegistrarAsync(string Usuario, string Descripcion);
    }
}
