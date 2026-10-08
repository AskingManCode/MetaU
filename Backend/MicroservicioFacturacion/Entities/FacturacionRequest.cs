using System;

namespace MicroservicioFacturacion.Entities
{
    public class FacturacionRequest
    {
        public string IdentificacionEstudiante { get; set; } = string.Empty;
        public decimal Monto { get; set; }
    }
}
