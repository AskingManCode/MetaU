namespace MicroservicioHistorialAcademico.Services
{
    public interface IExpedienteServiceClient
    {
        Task<bool> ValidarEstudianteAsync(
            string tipoIdentificacion,
            string identificacion,
            Guid usuario,
            string token);
    }
}