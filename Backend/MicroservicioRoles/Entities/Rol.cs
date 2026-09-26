using System.ComponentModel.DataAnnotations;

namespace MicroservicioRoles.Entities
{

	public class Rol
	{
		[Requered(AllEmptyStrings = false, ErrorMessage = "El id del rol es requerido")]
		public string IdRol { get; set; } = null!;

		[Requered(AllEmptyStrings = false, ErrorMessage = "El id del rol es requerido")]
		[RegularExpression(@"^[a-zA-ZáéíóúÁÉÍÓÚñÑ\s]+$", ErrorMessage = "El nombre del rol solo puede contener letras")]
		public string Nombre { get; set; } = null!;

	}
}