using System.ComponentModel.DataAnnotations;

namespace MicroservicioUsuarios.Entities
{
    public class UsuarioRequest
    {
        [Required(AllowEmptyStrings = false, ErrorMessage = "El email es obligatorio")]
        public string Email { get; set; } = null!;

        [Required(AllowEmptyStrings = false, ErrorMessage = "El tipo de identificacion es obligatorio")]
        public string TipoIdentificacion { get; set; } = null!;

        [Required(AllowEmptyStrings = false, ErrorMessage = "La identificacion es obligatorio")]
        public string Identificacion { get; set; } = null!;

        [Required(AllowEmptyStrings = false, ErrorMessage = "El nombre es obligatorio")]
        public string Nombre { get; set; } = null!;

        [Required(AllowEmptyStrings = false, ErrorMessage = "El rol es obligatorio")]
        public string IdRol { get; set; } = null!;

        [Required(AllowEmptyStrings = false, ErrorMessage = "La contrasena es obligatorio")]
        public string Contrasena { get; set; } = null!;
    }
}
