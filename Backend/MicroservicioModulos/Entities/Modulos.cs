using System.ComponentModel.DataAnnotations;

namespace MicroservicioModulos.Entities
{
    public class Modulos
    {
        [Required(AllowEmptyStrings = false, ErrorMessage = "El Id es obligatorio")]
        public string IdModulo { get; set; } = null!;

        [Required(AllowEmptyStrings = false, ErrorMessage = "El nombre del modulo es requerido")]
        [RegularExpression(@"^[a-zA-ZáéíóúÁÉÍÓÚñÑ\s]+$", ErrorMessage = "El nombre del modulo solo puede tener letras")]
        public string Nombre { get; set; } = null!;
    }
}
