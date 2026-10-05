ACA1 - Consulta del Historial Academico
Microservicio encargado de consultar el historial academico de un estudiante y obtener el promedio correspondiente a cada curso matriculado.
La informacion se obtiene mediante la integracion con los microservicios de Expedientes, Matriculas, Notas y Cursos. Adicionalmente, se valida la autenticacion mediante Login y se registra la consulta mediante Bitacoras.
Endpoint
Consultar historial academico
GET /historialacademico?tipoIdentificacion={tipoIdentificacion}&identificacion={identificacion}
Ejemplo
GET /historialacademico?tipoIdentificacion=CEDULA&identificacion=123456789
Parametros
Parametro	Tipo	Requerido	Descripcion
tipoIdentificacion	string	Si	Tipo de identificacion del estudiante
identificacion	string	Si	Numero de identificacion del estudiante


Autenticacion
La operacion requiere un token Bearer valido y el identificador del usuario autenticado.
Authorization: Bearer {token}
X-Usuario-Id: {usuarioId}
El token es validado mediante el MicroservicioLogin antes de ejecutar la consulta.
Respuesta exitosa
200 OK
Ejemplo:
[
  {
    "codigoCurso": "CURSOTEST",
    "nombreCurso": "Curso Prueba",
    "promedio": 89.00
  }
]
Flujo de procesamiento
1. Se valida el token mediante MicroservicioLogin.
2. Se valida la existencia del estudiante mediante MicroservicioExpedientesEstudiantes.
3. Se consultan las matriculas del estudiante mediante MicroservicioMatriculas.
4. Se obtienen el curso y grupo correspondientes a cada matricula.
5. Se consultan las notas y rubros mediante MicroservicioNotas.
6. Se calcula el promedio ponderado de cada curso.
7. Se consulta el nombre del curso mediante MicroservicioCursos.
8. Se registra la consulta mediante MicroservicioBitacoras.
9. Se devuelve el historial academico.
Calculo del promedio
El promedio se calcula utilizando la nota obtenida y el porcentaje asignado a cada rubro.
Promedio = suma de (Nota * Porcentaje / 100)
Ejemplo:
Examen: 85 * 60 / 100 = 51
Proyecto: 95 * 40 / 100 = 38

Promedio = 89
Integraciones
MicroservicioLogin
Valida el token Bearer recibido en la solicitud.
MicroservicioExpedientesEstudiantes
Valida la existencia del estudiante mediante el tipo de identificacion y la identificacion.
MicroservicioMatriculas
Obtiene las matriculas asociadas al estudiante y la informacion necesaria de curso y grupo.
MicroservicioNotas
Obtiene las notas del estudiante y el desglose de rubros utilizado para calcular el promedio.
MicroservicioCursos
Obtiene el nombre del curso mediante su codigo.
MicroservicioBitacoras
Registra la consulta realizada por el usuario.
Configuracion
Las URLs de los servicios externos se configuran en appsettings.json.
{
  "Servicios": {
    "LoginUrl": "",
    "BitacoraUrl": "",
    "ExpedienteUrl": "",
    "MatriculaUrl": "",
    "NotasUrl": "",
    "CursoUrl": ""
  }
}
Codigos HTTP
Codigo	Descripcion
200 OK	Consulta realizada correctamente
400 Bad Request	Parametros requeridos ausentes o invalidos
401 Unauthorized	Token ausente o invalido
500 Internal Server Error	Error interno durante el procesamiento


Dependencias
Para ejecutar el flujo completo deben estar disponibles los siguientes servicios:
- MicroservicioLogin
- MicroservicioBitacoras
- MicroservicioExpedientesEstudiantes
- MicroservicioMatriculas
- MicroservicioNotas
- MicroservicioCursos
Compilacion
dotnet build Backend/MicroservicioHistorialAcademico/MicroservicioHistorialAcademico.csproj
Ejecucion
dotnet run --project Backend/MicroservicioHistorialAcademico/MicroservicioHistorialAcademico.csproj