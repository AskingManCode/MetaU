MicroservicioCarreras (ACD2)

Servicio REST para administrar las carreras que ofrecen las instituciones en MetaU.

Responsable: Julián Solano Obando HU: ACD2 – Servicio para Administrar Carreras Endpoint base: /carrera URL local (http): http://localhost:5283 URL local (https): https://localhost:7126 URL base en producción: (pendiente de definir)

Tecnologías
.NET 10 + ASP.NET Core (Minimal APIs)
Dapper (SQL directo) sobre SQL Server
Base de datos: Oferta_Academica_DB (compartida con Instituciones y Profesores)
Estructura
text
MicroservicioCarreras/
|-- Entities/       # Modelos y DTOs
|-- Repository/     # Acceso a datos (Dapper)
|-- Services/       # Reglas de negocio y validaciones
|-- CarrerasEndpoints.cs
|-- Program.cs
Endpoints

Todas las operaciones requieren el header Authorization: Bearer <access_token>, obtenido en MicroservicioLogin (POST /login).

Método	Ruta	Descripción	Respuesta exitosa
POST	/carrera	Crear una carrera	201
PUT	/carrera/{id}	Modificar una carrera	200
DELETE	/carrera/{id}	Eliminar una carrera (eliminación lógica, Estado = 0)	200
GET	/carrera	Obtener todas las carreras	200
GET	/carrera/{id}	Obtener una carrera por llave primaria	200
GET	/carrera/institucion/{institucionId}	Obtener las carreras de una institución	200

 Confirmar la ruta de "por institución" y los códigos de estado contra el código final.

Cuerpo de crear / modificar

 Ajustar los nombres de campo al DTO real.

json
{
  "id": "TI",
  "nombre": "Tecnologias de la Informacion",
  "institucionId": "CUC",
  "directorId": "00000000-0000-0000-0000-000000000000"
}
Validaciones
Todos los datos son requeridos y no pueden ser vacíos ni espacios en blanco.
El nombre solo acepta letras y espacios.
La institución debe existir.
El director debe estar registrado como profesor (ACD6). Esta validación la hace la llave foránea de SQL Server, ya que Instituciones, Carreras y Profesores comparten Oferta_Academica_DB; no se llama a MicroservicioProfesores por HTTP.
Sin token válido, la respuesta es 401 Unauthorized.
Datos inválidos responden 400 Bad Request; un registro inexistente, 404 Not Found.