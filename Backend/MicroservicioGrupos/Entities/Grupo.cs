namespace MicroservicioGrupos.Entities
{
    public class Grupo
    {
        public int IdGrupo { get; set; }
        public int NumeroGrupo { get; set; }
        public int IdCurso { get; set; }
        public int IdProfesor { get; set; }
        public string Horario { get; set; } = string.Empty;
        public int Cupo { get; set; }
        public int IdPeriodo { get; set; }
    }
}