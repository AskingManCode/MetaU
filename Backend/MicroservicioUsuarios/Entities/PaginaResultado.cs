namespace MicroservicioUsuarios.Entities
{
    public class PaginaResultado<T>
    {
        public int Pagina { get; set; }
        public int TamanoPagina { get; set; }
        public int TotalRegistros { get; set; }
        public int TotalPaginas { get; set; }
        public IEnumerable<T> Datos { get; set; } = [];
    }
}