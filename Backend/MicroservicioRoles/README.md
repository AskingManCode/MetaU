# MicroservicioRoles

Administra el catálogo de roles de MetaU (USR2). Cada rol tiene un código único y un nombre.

**URL base del servicio:** pendiente de definir para cada ambiente; en ejecución local, `https://localhost:PORT`.

**Prefijo de rutas:** `/rol`

**Diagrama de clases:**

![Diagrama de Clases](../../Documentacion/Diagramas%20Generales/Clases/Microservicios/DiagramaClases-Roles.png)

## Antes de consumir la API

Todas las operaciones requieren estos headers:

| Header | Valor | Descripción |
| --- | --- | --- |
| `Authorization` | `Bearer <JWT>` | Token emitido por MicroservicioLogin. |
| `X-Usuario-Id` | `<GUID>` | Identificador del usuario que realiza la operación; se usa también para la bitácora. |

El servicio valida el token consultando MicroservicioLogin (`POST /validate`). Sin token o con token inválido responde `401 Unauthorized`. Si falta `X-Usuario-Id` o no es un GUID válido responde `400 Bad Request`.

El código del rol (`IdRol`) y el nombre (`Nombre`) deben tener solo letras.

## Endpoints

| Método | Ruta | Uso |
| --- | --- | --- |
| `GET` | `/rol/` | Obtener todos los roles. |
| `GET` | `/rol/{id}` | Obtener un rol por su ID. |
| `POST` | `/rol/` | Crear un rol. |
| `PUT` | `/rol/{id}` | Actualizar un rol existente. |
| `DELETE` | `/rol/{id}` | Eliminar un rol. |

### Crear

```http
POST /rol/
Authorization: Bearer <JWT>
X-Usuario-Id: 00000000-0000-0000-0000-000000000001
Content-Type: application/json

{
  "idRol": "EST",
  "nombre": "Estudiante"
}
```

Responde `201 Created` con el rol creado. Si el código ya existe, responde `409 Conflict`. Si el nombre tiene números o símbolos, responde `400 Bad Request`.

### Consultar

```http
GET /rol/EST
Authorization: Bearer <JWT>
X-Usuario-Id: 00000000-0000-0000-0000-000000000001
```

`200 OK` o `404 Not Found` en consulta individual; `200 OK` con arreglo en la colección.

### Actualizar

```http
PUT /rol/EST
Authorization: Bearer <JWT>
X-Usuario-Id: 00000000-0000-0000-0000-000000000001
Content-Type: application/json

{
  "idRol": "EST",
  "nombre": "Estudiante Regular"
}
```

El `idRol` del cuerpo debe coincidir con el de la ruta, si no responde `400 Bad Request`. `200 OK` con el rol actualizado o `404 Not Found`.

### Eliminar

```http
DELETE /rol/EST
Authorization: Bearer <JWT>
X-Usuario-Id: 00000000-0000-0000-0000-000000000001
```

`204 No Content` o `404 Not Found`.

## Formato de datos

```json
{
  "idRol": "EST",
  "nombre": "Estudiante"
}
```

## Respuestas y errores comunes

| Estado | Cuándo ocurre |
| --- | --- |
| `200 OK` | Consulta o actualización completada. |
| `201 Created` | Rol creado. |
| `204 No Content` | Rol eliminado. |
| `400 Bad Request` | Datos vacíos, nombre con formato inválido, o `X-Usuario-Id` ausente/no válido. |
| `401 Unauthorized` | Falta el header Bearer o el token no es válido. |
| `404 Not Found` | El ID solicitado no existe. |
| `409 Conflict` | Ya existe un rol con el ID indicado al crear. |
| `500 Internal Server Error` | Error técnico no recuperable al procesar la solicitud. |

Las operaciones registran acciones en MicroservicioBitacoras. Si la bitácora no está disponible, la operación principal continúa.

## Ejecutar y configurar

Requisitos: .NET 10, SQL Server con la base de datos `Usuarios_DB` creada (la tabla `Roles` vive ahí).

```powershell
dotnet run --project .\Backend\MicroservicioRoles\MicroservicioRoles.csproj
```

| Clave | Uso |
| --- | --- |
| `ConnectionStrings:Usuarios_DB` | Cadena de conexión a SQL Server y a `Usuarios_DB`. |
| `Servicios:LoginUrl` | URL base de MicroservicioLogin; el servicio invoca `validate`. |
| `Servicios:BitacoraUrl` | URL base de MicroservicioBitacoras; el servicio invoca `bitacora`. |

## Persistencia y componentes

Los datos se guardan en `Usuarios_DB.dbo.Roles`, con `RolCode` como clave primaria y `NombreRol` como nombre legible. La persistencia usa Dapper.

Flujo principal: endpoints HTTP -> validación de token y de usuario -> `RolService` -> `RolRepository` -> SQL Server.