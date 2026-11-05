namespace MicroservicioHistorialAcademico.Services
{
    public interface INotasServiceClient
    {
        Task<List<NotaRubroResponse>> ObtenerNotasAsync(string identificacion, string codigoCurso, string grupoCode, Guid usuario, string token);
        Task<List<RubroResponse>> ObtenerDesgloseAsync(string codigoGrupo, Guid usuario, string token);
    }

    public class NotaRubroResponse
    {
        public int NotaXEstudianteID { get; set; }
        public Guid RubroID { get; set; }
        public Guid EstudianteID { get; set; }
        public decimal Nota { get; set; }
        public DateOnly FechaRegistro { get; set; }
    }

    public class RubroResponse
    {
        public Guid RubroID { get; set; }
        public string GrupoCode { get; set; } = string.Empty;
        public string NombreRubro { get; set; } = string.Empty;
        public decimal Porcentaje { get; set; }
        public bool Bloqueado { get; set; }
        public bool Estado { get; set; }
    }
}