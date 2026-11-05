namespace MicroservicioInstituciones.Entities
{
    // Solo el nombre se puede modificar, el InstitucionCode va en la ruta (PUT /institucion/{id})
    public class InstitucionUpdateRequest
    {
        public string Nombre { get; set; } = string.Empty;
    }
}
