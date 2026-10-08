using MicroservicioCursos.Entities;
using MicroservicioCursos.Repository;
using System.Text.RegularExpressions;

namespace MicroservicioCursos.Services
{
    public class CursoService : ICursoService
    {
        private readonly ICursoRepository _repository;

        public CursoService(ICursoRepository repository)
        {
            _repository = repository;
        }

        public async Task CrearAsync(Curso curso)
        {
            ValidarCurso(curso);
            await _repository.CrearAsync(curso);
        }

        public async Task ModificarAsync(Curso curso)
        {
            ValidarCurso(curso);
            await _repository.ModificarAsync(curso);
        }

        public Task EliminarAsync(string cursoCode)
        {
            return _repository.EliminarAsync(cursoCode);
        }

        public Task<IEnumerable<Curso>> ObtenerTodosAsync()
        {
            return _repository.ObtenerTodosAsync();
        }

        public Task<Curso?> ObtenerPorIdAsync(string cursoCode)
        {
            return _repository.ObtenerPorIdAsync(cursoCode);
        }

        public Task<IEnumerable<Curso>> ObtenerPorCarreraAsync(string carreraCode)
        {
            if (string.IsNullOrWhiteSpace(carreraCode))
                throw new ArgumentException("La carrera es requerida");

            return _repository.ObtenerPorCarreraAsync(carreraCode);
        }

        private static void ValidarCurso(Curso curso)
        {
            if (curso is null)
                throw new ArgumentException("Los datos del curso son requeridos");

            if (string.IsNullOrWhiteSpace(curso.CursoCode))
                throw new ArgumentException("El identificador del curso es requerido");

            if (string.IsNullOrWhiteSpace(curso.CarreraCode))
                throw new ArgumentException("La carrera es requerida");

            if (string.IsNullOrWhiteSpace(curso.Nombre))
                throw new ArgumentException("El nombre del curso es requerido");

            if (!Regex.IsMatch(curso.Nombre.Trim(), @"^[\p{L} ]+$"))
                throw new ArgumentException("El nombre del curso solo puede contener letras y espacios");

            if (curso.Nivel < 1 || curso.Nivel > 12)
                throw new ArgumentException("El nivel debe estar entre 1 y 12");
        }
    }
}