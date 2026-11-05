namespace MicroservicioExpedientesEstudiantes.Entities
{
    public class Direccion
    {
        public Guid ProvinciaID { get; set; }
        public Guid CantonID { get; set; }
        public Guid DistritoID { get; set; }
        public string OtrasSenas { get; set; } = string.Empty;
    }
}
