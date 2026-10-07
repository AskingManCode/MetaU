# MicroservicioModulos

Administra el catálogo de módulos de MetaU (USR4). Cada módulo tiene un código único y un nombre.

**URL base del servicio:** pendiente de definir para cada ambiente; en ejecución local, `https://localhost:PORT`.

**Prefijo de rutas:** `/modulo`

**Diagrama de clases:**

![Diagrama de Clases](../../Documentacion/Diagramas%20Generales/Clases/Microservicios/DiagramaClases_AdministracionModulos.png)

## Antes de consumir la API

Todas las operaciones requieren estos headers:

| Header | Valor | Descripción |
| --- | --- | --- |
| `Authorization` | `Bearer <JWT>` | Token emitido por MicroservicioLogin. |
| `X-Usuario-Id` | `<GUID>` | Identificador del usuario que realiza la operación; se usa también para la bitácora. |

El servicio valida el token consultando MicroservicioLogin (`POST /validate`). Sin token o con token inválido responde `401 Unauthorized`. Si falta `X-Usuario-Id` o no es un GUID válido responde `400 Bad Request`.

El código del módulo (`IdModulo`) y el nombre (`Nombre`) deben tener solo letras.

## Endpoints

| Método | Ruta | Uso |
| --- | --- | --- |
| `GET` | `/modulo/` | Obtener todos los módulos. |
| `GET` | `/modulo/{id}` | Obtener un módulo por su ID. |
| `POST` | `/modulo/` | Crear un módulo. |
| `PUT` | `/modulo/{id}` | Actualizar un módulo existente. |
| `DELETE` | `/modulo/{id}` | Eliminar un módulo. |

### Crear

```http
POST /modulo/
Authorization: Bearer <JWT>
X-Usuario-Id: 00000000-0000-0000-0000-000000000001
Content-Type: application/json

{
  "idModulo": "USR",
  "nombre": "Usuarios"
}
```

Responde `201 Created`. Si el código ya existe, responde `409 Conflict`. Si el nombre tiene números o símbolos, responde `400 Bad Request`.

### Consultar

```http
GET /modulo/USR
Authorization: Bearer <JWT>
X-Usuario-Id: 00000000-0000-0000-0000-000000000001
```

`200 OK` o `404 Not Found`; la colección devuelve `200 OK` con un arreglo.

### Actualizar

```http
PUT /modulo/USR
Authorization: Bearer <JWT>
X-Usuario-Id: 00000000-0000-0000-0000-000000000001
Content-Type: application/json

{
  "idModulo": "USR",
  "nombre": "Administracion de Usuarios"
}
```

`200 OK` con el módulo actualizado o `404 Not Found`.

### Eliminar

```http
DELETE /modulo/USR
Authorization: Bearer <JWT>
X-Usuario-Id: 00000000-0000-0000-0000-000000000001
```

`204 No Content` o `404 Not Found`.

## Formato de datos

```json
{
  "idModulo": "USR",
  "nombre": "Usuarios"
}
```

## Respuestas y errores comunes

| Estado | Cuándo ocurre |
| --- | --- |
| `200 OK` | Consulta o actualización completada. |
| `201 Created` | Módulo creado. |
| `204 No Content` | Módulo eliminado. |
| `400 Bad Request` | Datos vacíos, nombre inválido, o `X-Usuario-Id` ausente/no válido. |
| `401 Unauthorized` | Falta el header Bearer o el token no es válido. |
| `404 Not Found` | El ID solicitado no existe. |
| `409 Conflict` | Ya existe un módulo con el ID indicado al crear. |
| `500 Internal Server Error` | Error técnico no recuperable al procesar la solicitud. |

Las operaciones registran acciones en MicroservicioBitacoras. Si la bitácora no está disponible, la operación principal continúa.

## Ejecutar y configurar

Requisitos: .NET 10, SQL Server con la base de datos `Usuarios_DB` creada (la tabla `Modulos` vive ahí).

```powershell
dotnet run --project .\Backend\MicroservicioModulos\MicroservicioModulos.csproj
```

| Clave | Uso |
| --- | --- |
| `ConnectionStrings:Usuarios_DB` | Cadena de conexión a SQL Server y a `Usuarios_DB`. |
| `Servicios:LoginUrl` | URL base de MicroservicioLogin; el servicio invoca `validate`. |
| `Servicios:BitacoraUrl` | URL base de MicroservicioBitacoras; el servicio invoca `bitacora`. |

## Persistencia y componentes

Los datos se guardan en `Usuarios_DB.dbo.Modulos`, con `ModuloCode` como clave primaria y `Nombre` como nombre legible. La persistencia usa Dapper.

Flujo principal: endpoints HTTP -> validación de token y de usuario -> `ModuloService` -> `ModuloRepository` -> SQL Server.