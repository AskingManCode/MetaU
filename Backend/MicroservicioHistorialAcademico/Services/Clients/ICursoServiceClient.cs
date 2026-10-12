namespace MicroservicioHistorialAcademico.Services
{
    public interface ICursoServiceClient
    {
        Task<CursoResponse?> ObtenerPorCodigoAsync(string cursoCode, Guid usuario, string token);
    }

    public class CursoResponse
    {
        public string CursoCode { get; set; } = string.Empty;
        public string CarreraCode { get; set; } = string.Empty;
        public string Nombre { get; set; } = string.Empty;
        public byte Nivel { get; set; }
        public bool Estado { get; set; }
    }
}