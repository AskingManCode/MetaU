using MicroservicioListaEstudiantes.Entities;

namespace MicroservicioListaEstudiantes.Services
{
    public class ListadoEstudiantesService : IListadoEstudiantesService
    {
        private readonly IGrupoServiceClient _grupoClient;
        private readonly IMatriculaServiceClient _matriculaClient;
        private readonly ICursoServiceClient _cursoClient;
        private readonly ICarreraServiceClient _carreraClient;

        public ListadoEstudiantesService(
            IGrupoServiceClient grupoClient,
            IMatriculaServiceClient matriculaClient,
            ICursoServiceClient cursoClient,
            ICarreraServiceClient carreraClient)
        {
            _grupoClient = grupoClient;
            _matriculaClient = matriculaClient;
            _cursoClient = cursoClient;
            _carreraClient = carreraClient;
        }

        public async Task<IEnumerable<EstudianteMatriculado>> ObtenerPorPeriodoAsync(Guid periodo, Guid usuarioId, string token)
        {
            var grupos = await _grupoClient.ObtenerTodosAsync(usuarioId, token);
            var gruposDelPeriodo = grupos.Where(g => g.PeriodoID == periodo).ToList();

            var resultado = new List<EstudianteMatriculado>();

            foreach (var grupo in gruposDelPeriodo)
            {
                var estudiantes = await _matriculaClient.ObtenerPorCursoYGrupoAsync(grupo.CursoCode, grupo.GrupoCode, usuarioId, token);

                var curso = await _cursoClient.ObtenerPorIdAsync(grupo.CursoCode, usuarioId, token);
                var carrera = curso is not null
                    ? await _carreraClient.ObtenerPorIdAsync(curso.CarreraCode, usuarioId, token)
                    : null;

                foreach (var est in estudiantes)
                {
                    resultado.Add(new EstudianteMatriculado
                    {
                        Llave = est.Identificacion,
                        TipoIdentificacion = est.TipoIdentificacion,
                        Identificacion = est.Identificacion,
                        NombreCompleto = est.NombreCompleto,
                        Carrera = carrera?.Nombre ?? "N/D",
                        Curso = curso?.Nombre ?? grupo.CursoCode, 
                        Grupo = grupo.NumeroGrupo.ToString()
                    });
                }
            }

            return resultado;
        }
    }
}