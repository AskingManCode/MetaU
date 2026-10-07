namespace MicroservicioListaEstudiantes.Entities
{
    public class EstudianteMatriculado
    {
        public string Llave { get; set; } = null!;
        public string TipoIdentificacion { get; set; } = null!;
        public string Identificacion { get; set; } = null!;
        public string NombreCompleto { get; set; } = null!;
        public string Carrera { get; set; } = null!;
        public string Curso { get; set; } = null!;
        public string Grupo { get; set; } = null!;
    }
}