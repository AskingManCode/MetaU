using MicroservicioHistorialAcademico.Entities;

namespace MicroservicioHistorialAcademico.Services
{
    public class HistorialAcademicoService : IHistorialAcademicoService
    {
        private readonly IExpedienteServiceClient _expedientes;
        private readonly IMatriculaServiceClient _matriculas;
        private readonly INotasServiceClient _notas;
        private readonly ICursoServiceClient _cursos;

        public HistorialAcademicoService(IExpedienteServiceClient expedientes, IMatriculaServiceClient matriculas, INotasServiceClient notas, ICursoServiceClient cursos)
        {
            _expedientes = expedientes;
            _matriculas = matriculas;
            _notas = notas;
            _cursos = cursos;
        }

        public async Task<IEnumerable<HistorialAcademico>> ObtenerAsync(string tipoIdentificacion, string identificacion, Guid usuario, string token)
        {
            var estudianteValido = await _expedientes.ValidarEstudianteAsync(tipoIdentificacion, identificacion, usuario, token);

            if (!estudianteValido)
                throw new KeyNotFoundException("No existe un estudiante con el tipo e identificacion indicados.");

            var matriculas = await _matriculas.ObtenerPorEstudianteAsync(identificacion, usuario, token);
            var historial = new List<HistorialAcademico>();

            foreach (var matricula in matriculas)
            {
                var notas = await _notas.ObtenerNotasAsync(identificacion, matricula.CursoCode, matricula.GrupoCode, usuario, token);
                var rubros = await _notas.ObtenerDesgloseAsync(matricula.GrupoCode, usuario, token);
                var curso = await _cursos.ObtenerPorCodigoAsync(matricula.CursoCode, usuario, token);
                decimal promedio = 0;

                foreach (var rubro in rubros)
                {
                    var nota = notas.FirstOrDefault(x => x.RubroID == rubro.RubroID);

                    if (nota is not null)
                        promedio += nota.Nota * rubro.Porcentaje / 100m;
                }

                historial.Add(new HistorialAcademico
                {
                    CodigoCurso = matricula.CursoCode,
                    NombreCurso = curso?.Nombre ?? matricula.CursoCode,
                    Promedio = Math.Round(promedio, 2)
                });
            }

            return historial;
        }
    }
}