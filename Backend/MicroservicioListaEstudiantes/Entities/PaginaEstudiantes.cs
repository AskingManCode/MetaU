namespace MicroservicioListaEstudiantes.Entities
{
    public class OpcionesFiltro
    {
        public IEnumerable<string> Carreras { get; set; } = [];
        public IEnumerable<string> Cursos { get; set; } = [];
        public IEnumerable<string> Grupos { get; set; } = [];
    }

    public class PaginaEstudiantes
    {
        public int Pagina { get; set; }
        public int TamanoPagina { get; set; }
        public int TotalRegistros { get; set; }
        public int TotalPaginas { get; set; }
        public IEnumerable<EstudianteMatriculado> Datos { get; set; } = [];
        public OpcionesFiltro Opciones { get; set; } = new();
    }
}