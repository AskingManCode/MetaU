using MicroservicioProfesores.Entities;
using MicroservicioProfesores.Repository;
using System.Net.Mail;

namespace MicroservicioProfesores.Services
{
    public class ProfesorService : IProfesorService
    {
        private readonly IProfesorRepository _repository;

        public ProfesorService(IProfesorRepository repository)
        {
            _repository = repository;
        }

        public async Task<Profesor> CrearAsync(Profesor profesor, string dominioCorreo)
        {
            ValidarProfesor(profesor, dominioCorreo);
            return await _repository.CrearAsync(profesor);
        }

        public async Task ModificarAsync(Profesor profesor, string dominioCorreo)
        {
            ValidarProfesor(profesor, dominioCorreo);
            await _repository.ModificarAsync(profesor);
        }

        public Task EliminarAsync(int profesorID)
        {
            return _repository.EliminarAsync(profesorID);
        }

        public Task<IEnumerable<Profesor>> ObtenerTodosAsync()
        {
            return _repository.ObtenerTodosAsync();
        }

        public Task<Profesor?> ObtenerPorIdAsync(int profesorID)
        {
            return _repository.ObtenerPorIdAsync(profesorID);
        }

        private static void ValidarProfesor(Profesor profesor, string dominioCorreo)
        {
            if (string.IsNullOrWhiteSpace(profesor.Identificacion))
                throw new ArgumentException("La identificacion es requerida");

            if (string.IsNullOrWhiteSpace(profesor.TipoIdentificacionCode))
                throw new ArgumentException("El tipo de identificacion es requerido");

            if (string.IsNullOrWhiteSpace(profesor.Email))
                throw new ArgumentException("El correo electronico es requerido");

            if (string.IsNullOrWhiteSpace(profesor.NombreCompleto))
                throw new ArgumentException("El nombre completo es requerido");

            if (profesor.FechaNacimiento == default)
                throw new ArgumentException("La fecha de nacimiento es requerida");

            if (profesor.Telefonos == null || profesor.Telefonos.Count == 0 || profesor.Telefonos.Any(string.IsNullOrWhiteSpace))
                throw new ArgumentException("El telefono es requerido");

            if (!profesor.NombreCompleto.All(c => char.IsLetter(c) || char.IsWhiteSpace(c)))
                throw new ArgumentException("El nombre completo solo puede contener letras y espacios");

            if (!EsMayorDeEdad(profesor.FechaNacimiento))
                throw new ArgumentException("El profesor debe ser mayor de edad");

            if (!EmailValido(profesor.Email))
                throw new ArgumentException("El formato del correo electronico no es valido");

            if (string.IsNullOrWhiteSpace(dominioCorreo))
                throw new InvalidOperationException("No se encontro el dominio de correo configurado");

            var dominio = profesor.Email.Split('@').Last();

            if (!dominio.Equals(dominioCorreo, StringComparison.OrdinalIgnoreCase))
                throw new ArgumentException($"El correo electronico debe pertenecer al dominio {dominioCorreo}");
        }

        private static bool EsMayorDeEdad(DateTime fechaNacimiento)
        {
            var hoy = DateTime.Today;
            var edad = hoy.Year - fechaNacimiento.Year;

            if (fechaNacimiento.Date > hoy.AddYears(-edad))
                edad--;

            return edad >= 18;
        }

        private static bool EmailValido(string email)
        {
            try
            {
                var correo = new MailAddress(email);
                return correo.Address == email;
            }
            catch
            {
                return false;
            }
        }
    }
}