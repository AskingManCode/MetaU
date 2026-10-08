namespace MicroservicioCarreras.Entities
{
    // CarreraCode e InstitucionCode no se pueden modificar (son la llave y la
    // institucion a la que pertenece); solo Nombre y Director.
    public class CarreraUpdateRequest
    {
        public string Nombre { get; set; } = string.Empty;
        public Guid DirectorID { get; set; }
    }
}
