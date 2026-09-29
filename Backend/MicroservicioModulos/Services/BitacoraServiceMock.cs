namespace MicroservicioModulos.Services
{
    public class BitacoraServiceMock : IBitacoraService
    {
        public Task RegistrarAsync(string usuario, string descripcion)
        {
            Console.WriteLine($"[BITACORA MOCK] Usuario: {usuario} | Acción: {descripcion} | Fecha: {DateTime.Now}");
            return Task.CompletedTask;
        }
    }
}
