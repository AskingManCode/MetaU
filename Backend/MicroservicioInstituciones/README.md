MicroservicioInstituciones (ACD1)

Servicio REST para administrar las instituciones educativas registradas en MetaU.

Responsable: Julián Solano Obando HU: ACD1 – Servicio para Administrar Instituciones Endpoint base: /institucion URL local (http): http://localhost:5128 URL local (https): https://localhost:7099 URL base en producción: (pendiente de definir)

Tecnologías
.NET 10 + ASP.NET Core (Minimal APIs)
Dapper (SQL directo) sobre SQL Server
Base de datos: Oferta_Academica_DB (compartida con Carreras y Profesores)
Estructura
text
MicroservicioInstituciones/
|-- Entities/       # Modelos y DTOs
|-- Repository/     # Acceso a datos (Dapper)
|-- Services/       # Reglas de negocio y validaciones
|-- InstitucionesEndpoints.cs
|-- Program.cs
Endpoints

Todas las operaciones requieren el header Authorization: Bearer <access_token>, obtenido en MicroservicioLogin (POST /login).

Método	Ruta	Descripción	Respuesta exitosa
POST	/institucion	Crear una institución	201
PUT	/institucion/{id}	Modificar una institución	200
DELETE	/institucion/{id}	Eliminar una institución (eliminación lógica, Estado = 0)	200
GET	/institucion	Obtener todas las instituciones	200
GET	/institucion/{id}	Obtener una institución por llave primaria