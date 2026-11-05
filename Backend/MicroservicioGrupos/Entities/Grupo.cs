namespace MicroservicioGrupos.Entities
{
    public class Grupo
    {
        public string GrupoCode { get; set; } = string.Empty;
        public byte NumeroGrupo { get; set; }
        public string CursoCode { get; set; } = string.Empty;
        public Guid ProfesorID { get; set; }
        public string Horario { get; set; } = string.Empty;
        public int Cupo { get; set; }
        public Guid PeriodoID { get; set; }
        public bool Estado { get; set; }
    }
}