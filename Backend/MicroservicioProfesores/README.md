# MicroservicioProfesores

Administra la información de los profesores de MetaU mediante operaciones REST para crear, modificar, eliminar y consultar profesores.

**URL base del servicio:** pendiente de definir para cada ambiente; en ejecución local, `https://localhost:PORT`.

**Ruta principal:** `/profesor`

## Antes de consumir la API

Todas las operaciones requieren los siguientes headers:

| Header | Valor | Descripción |
| --- | --- | --- |
| `Authorization` | `Bearer <JWT>` | Token emitido por MicroservicioLogin. |
| `X-Usuario-Id` | `<UUID>` | GUID del usuario autenticado que ejecuta la operación y se utiliza para el registro de bitácora. |

El servicio valida el token consultando MicroservicioLogin. Si el token no se envía o no es válido, responde `401 Unauthorized`.

Los cuerpos y respuestas utilizan formato JSON.

## Endpoints

| Método | Ruta | Uso |
| --- | --- | --- |
| `POST` | `/profesor` | Crear un profesor. |
| `PUT` | `/profesor/{profesorID}` | Modificar un profesor existente. |
| `DELETE` | `/profesor/{profesorID}` | Eliminar un profesor. |
| `GET` | `/profesor` | Obtener todos los profesores. |
| `GET` | `/profesor/{profesorID}` | Obtener un profesor por su identificador. |

`profesorID` corresponde a un GUID.

## Datos del profesor

El servicio maneja la siguiente información:

| Campo | Descripción |
| --- | --- |
| `profesorID` | Identificador único del profesor generado como GUID. |
| `usuarioID` | GUID del usuario asociado al profesor. |
| `tipoIdentificacionCode` | Tipo de identificación del profesor. |
| `identificacion` | Número de identificación. |
| `email` | Correo electrónico institucional. |
| `nombreCompleto` | Nombre completo del profesor. |
| `fechaNacimiento` | Fecha de nacimiento. |
| `estado` | Estado del registro. |
| `telefonos` | Lista de teléfonos asociados al profesor. |

## Validaciones

El microservicio aplica las siguientes validaciones:

- Los datos requeridos no pueden estar vacíos.
- El nombre completo únicamente puede contener letras y espacios.
- El profesor debe ser mayor de edad.
- El correo electrónico debe tener un formato válido.
- El correo debe pertenecer al dominio institucional configurado para profesores.
- El dominio permitido no se encuentra quemado directamente en la lógica del microservicio.
- El dominio se obtiene desde MicroservicioParametros mediante el parámetro `DOMPROF`.
- Todas las operaciones requieren un token válido obtenido mediante MicroservicioLogin.
- Las acciones realizadas son registradas mediante MicroservicioBitacoras.

## Crear profesor

```http
POST /profesor
Authorization: Bearer <JWT>
X-Usuario-Id: 00000000-0000-0000-0000-000000000001
Content-Type: application/json
```

Ejemplo de request:

```json
{
  "usuarioID": "00000000-0000-0000-0000-000000000001",
  "tipoIdentificacionCode": "CED",
  "identificacion": "123456789",
  "email": "profesor.prueba@cuc.ac.cr",
  "nombreCompleto": "Profesor Prueba",
  "fechaNacimiento": "1990-05-15",
  "telefonos": [
    "88888888"
  ]
}
```

Una creación correcta responde `201 Created`.

Ejemplo de response:

```json
{
  "profesorID": "00000000-0000-0000-0000-000000000002",
  "usuarioID": "00000000-0000-0000-0000-000000000001",
  "tipoIdentificacionCode": "CED",
  "identificacion": "123456789",
  "email": "profesor.prueba@cuc.ac.cr",
  "nombreCompleto": "Profesor Prueba",
  "fechaNacimiento": "1990-05-15T00:00:00",
  "estado": true,
  "telefonos": [
    "88888888"
  ]
}
```

## Modificar profesor

```http
PUT /profesor/{profesorID}
Authorization: Bearer <JWT>
X-Usuario-Id: <UUID>
Content-Type: application/json
```

Ejemplo de request:

```json
{
  "usuarioID": "00000000-0000-0000-0000-000000000001",
  "tipoIdentificacionCode": "CED",
  "identificacion": "123456789",
  "email": "profesor.modificado@cuc.ac.cr",
  "nombreCompleto": "Profesor Prueba Modificado",
  "fechaNacimiento": "1990-05-15",
  "telefonos": [
    "88888888",
    "87777777"
  ]
}
```

Responde `200 OK` cuando el profesor existe y los datos enviados son válidos.

Si el profesor no existe responde `404 Not Found`.

## Obtener todos los profesores

```http
GET /profesor
Authorization: Bearer <JWT>
X-Usuario-Id: <UUID>
```

Responde `200 OK` con un arreglo de profesores.

Ejemplo:

```json
[
  {
    "profesorID": "00000000-0000-0000-0000-000000000002",
    "usuarioID": "00000000-0000-0000-0000-000000000001",
    "tipoIdentificacionCode": "CED",
    "identificacion": "123456789",
    "email": "profesor.prueba@cuc.ac.cr",
    "nombreCompleto": "Profesor Prueba",
    "fechaNacimiento": "1990-05-15T00:00:00",
    "estado": true,
    "telefonos": [
      "88888888"
    ]
  }
]
```

## Obtener profesor por ID

```http
GET /profesor/{profesorID}
Authorization: Bearer <JWT>
X-Usuario-Id: <UUID>
```

Responde:

- `200 OK` si el profesor existe.
- `404 Not Found` si no existe.

Ejemplo de respuesta cuando no existe:

```json
{
  "mensaje": "El profesor no existe"
}
```

## Eliminar profesor

```http
DELETE /profesor/{profesorID}
Authorization: Bearer <JWT>
X-Usuario-Id: <UUID>
```

Si el profesor existe responde `200 OK` con la información del registro eliminado.

Una consulta posterior al mismo `profesorID` responde `404 Not Found`.

## Dominio de correo parametrizable

El dominio permitido para los correos de profesores se obtiene dinámicamente desde MicroservicioParametros.

El identificador utilizado es:

```text
DOMPROF
```

Actualmente el parámetro puede contener:

```text
cuc.ac.cr
```

Por ejemplo, el correo:

```text
profesor.prueba@cuc.ac.cr
```

es válido.

Mientras que:

```text
profesor.prueba@gmail.com
```

es rechazado con `400 Bad Request`.

Ejemplo:

```json
{
  "mensaje": "El correo electronico debe pertenecer al dominio cuc.ac.cr"
}
```

Esto permite modificar el dominio autorizado desde la parametrización sin tener que cambiar la lógica del microservicio.

## Validación de mayoría de edad

La fecha de nacimiento se valida antes de crear o modificar un profesor.

El profesor debe tener al menos 18 años. Si no cumple con la mayoría de edad, la solicitud responde `400 Bad Request`.

## Validación del nombre

El nombre completo es obligatorio y únicamente permite letras y espacios.

Los nombres que contienen números u otros caracteres no permitidos son rechazados con `400 Bad Request`.

## Autenticación

Todas las operaciones requieren un Bearer Token.

Ejemplo:

```http
Authorization: Bearer <JWT>
```

El token se valida mediante MicroservicioLogin.

Una solicitud sin un token válido responde:

```http
401 Unauthorized
```

## Bitácora

Las operaciones realizadas sobre profesores generan registros mediante MicroservicioBitacoras.

El usuario que ejecuta la acción se obtiene del header:

```text
X-Usuario-Id
```

Se registran acciones relacionadas con:

- Creación.
- Modificación.
- Eliminación.
- Consultas.
- Errores técnicos.

En una modificación se conserva información del registro anterior y del registro actualizado para mantener trazabilidad.

## Respuestas y errores comunes

| Estado | Cuándo ocurre |
| --- | --- |
| `200 OK` | Consulta, modificación o eliminación completada correctamente. |
| `201 Created` | Profesor creado correctamente. |
| `400 Bad Request` | Datos inválidos, nombre incorrecto, menor de edad, dominio de correo incorrecto o usuario requerido inválido. |
| `401 Unauthorized` | Token ausente o inválido. |
| `404 Not Found` | El profesor solicitado no existe. |
| `500 Internal Server Error` | Error técnico no recuperable durante el procesamiento. |

## Integraciones

### MicroservicioLogin

Se utiliza para validar el Bearer Token enviado por el usuario antes de ejecutar las operaciones.

### MicroservicioParametros

Se utiliza para obtener el dominio permitido del correo electrónico mediante el parámetro `DOMPROF`.

### MicroservicioBitacoras

Se utiliza para registrar las acciones realizadas sobre los profesores y mantener trazabilidad de las operaciones.

## Configuración

El microservicio utiliza las siguientes claves de configuración:

| Clave | Uso |
| --- | --- |
| `ConnectionStrings:OfertaAcademica` | Cadena de conexión a la base de datos de oferta académica. |
| `Servicios:LoginUrl` | URL base de MicroservicioLogin. |
| `Servicios:BitacoraUrl` | URL base de MicroservicioBitacoras. |
| `Servicios:ParametroUrl` | URL base de MicroservicioParametros. |
| `Parametros:IdentificadorDominioProfesor` | Identificador del parámetro utilizado para consultar el dominio permitido. |

El identificador configurado para el dominio es:

```text
DOMPROF
```

Las credenciales, cadenas de conexión y URLs específicas de cada ambiente no deben almacenarse directamente en el repositorio.

## Persistencia y arquitectura

La información de profesores se almacena en SQL Server.

El microservicio utiliza una arquitectura separada por responsabilidades:

```text
Endpoint
   ↓
ProfesorService
   ↓
ProfesorRepository
   ↓
SQL Server
```

Además, los endpoints consumen los clientes de integración necesarios para autenticación, parametrización y bitácoras.

Las capas principales son:

- `Entities`: modelos del dominio.
- `Services`: reglas de negocio e integraciones.
- `Repository`: acceso a datos.
- `ProfesoresEndpoints`: definición de las operaciones REST.
- `Program`: configuración e inyección de dependencias.

## Ejecutar el microservicio

Requisitos:

- .NET 10.
- SQL Server.
- Base de datos de Oferta Académica configurada.
- MicroservicioLogin disponible.
- MicroservicioParametros disponible.
- MicroservicioBitacoras disponible.

Desde la raíz del repositorio:

```powershell
dotnet run --project .\Backend\MicroservicioProfesores\MicroservicioProfesores.csproj
```