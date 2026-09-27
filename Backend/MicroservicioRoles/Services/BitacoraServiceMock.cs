namespace MicroservicioRoles.Services
{
    public class BitacoraServiceMock : IBitacoraService
    {
        public Task RegistrarAsync(string Usuario, string Descripcion)
        {
            Console.WriteLine($"[BITACORA MOCK] Usuario: {Usuario} | Acción: {Descripcion} | Fecha: {DateTime.Now}");
            return Task.CompletedTask;
        }
    }
}
