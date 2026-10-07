# MicroservicioUsuarios

Administra los usuarios de MetaU (USR1): creación, consulta, filtrado, actualización y eliminación, con validación de dominio de correo y rol.

**URL base del servicio:** pendiente de definir para cada ambiente; en ejecución local, `https://localhost:PORT`.

**Prefijo de rutas:** `/usuario`

**Diagrama de clases:**

![Diagrama de Clases](../../Documentacion/Diagramas%20Generales/Clases/Microservicios/DiagramaClases_AdministracionUsuarios.png)

## Antes de consumir la API

Todas las operaciones requieren estos headers:

| Header | Valor | Descripción |
| --- | --- | --- |
| `Authorization` | `Bearer <JWT>` | Token emitido por MicroservicioLogin. |
| `X-Usuario-Id` | `<GUID>` | Identificador del usuario que realiza la operación; se usa también para la bitácora. |

El servicio valida el token consultando MicroservicioLogin (`POST /validate`). Sin token o con token inválido responde `401 Unauthorized`. Si falta `X-Usuario-Id` o no es un GUID válido responde `400 Bad Request`.

El email es la identificación única del usuario y debe pertenecer a uno de los dominios configurados. El nombre completo admite solo letras y espacios. La contraseña se almacena encriptada y nunca se devuelve en texto plano.

## Endpoints

| Método | Ruta | Uso |
| --- | --- | --- |
| `GET` | `/usuario/` | Obtener todos los usuarios, o filtrar por `identificacion`, `nombre` y/o `tipo` como query string. |
| `GET` | `/usuario/{email}` | Obtener un usuario por su email (llave primaria). |
| `POST` | `/usuario/` | Crear un usuario. |
| `PUT` | `/usuario/{email}` | Actualizar un usuario existente (contraseña opcional). |
| `DELETE` | `/usuario/{email}` | Eliminar un usuario. |

### Crear

```http
POST /usuario/
Authorization: Bearer <JWT>
X-Usuario-Id: 00000000-0000-0000-0000-000000000001
Content-Type: application/json

{
  "email": "juan.perez@cuc.cr",
  "tipoIdentificacion": "CED",
  "identificacion": "123456789",
  "nombre": "Juan Perez",
  "idRol": "EST",
  "contrasena": "Clave123!"
}
```

Responde `201 Created`. Si el email ya existe, `409 Conflict`. Si el email no pertenece a un dominio válido, o el rol no corresponde al dominio, responde `400 Bad Request`.

### Consultar

```http
GET /usuario/juan.perez@cuc.cr
Authorization: Bearer <JWT>
X-Usuario-Id: 00000000-0000-0000-0000-000000000001
```

`200 OK` o `404 Not Found`. Para filtrar: `GET /usuario/?nombre=Juan`.

### Actualizar

```http
PUT /usuario/juan.perez@cuc.cr
Authorization: Bearer <JWT>
X-Usuario-Id: 00000000-0000-0000-0000-000000000001
Content-Type: application/json

{
  "email": "juan.perez@cuc.cr",
  "tipoIdentificacion": "CED",
  "identificacion": "123456789",
  "nombre": "Juan Perez Mora",
  "idRol": "EST"
}
```

El campo `contrasena` es opcional al actualizar. `200 OK` o `404 Not Found`.

### Eliminar

```http
DELETE /usuario/juan.perez@cuc.cr
Authorization: Bearer <JWT>
X-Usuario-Id: 00000000-0000-0000-0000-000000000001
```

`204 No Content` o `404 Not Found`.

## Formato de datos

```json
{
  "email": "juan.perez@cuc.cr",
  "tipoIdentificacion": "CED",
  "identificacion": "123456789",
  "nombre": "Juan Perez",
  "idRol": "EST",
  "contrasena": "Clave123!"
}
```

## Respuestas y errores comunes

| Estado | Cuándo ocurre |
| --- | --- |
| `200 OK` | Consulta o actualización completada. |
| `201 Created` | Usuario creado. |
| `204 No Content` | Usuario eliminado. |
| `400 Bad Request` | Datos vacíos, formato de email inválido, dominio no permitido, rol incompatible, o `X-Usuario-Id` ausente/no válido. |
| `401 Unauthorized` | Falta el header Bearer o el token no es válido. |
| `404 Not Found` | El email solicitado no existe. |
| `409 Conflict` | Ya existe un usuario con el email indicado al crear. |
| `500 Internal Server Error` | Error técnico no recuperable al procesar la solicitud. |

Las operaciones registran acciones en MicroservicioBitacoras. Si la bitácora no está disponible, la operación principal continúa.

## Ejecutar y configurar

Requisitos: .NET 10, SQL Server con la base de datos `Usuarios_DB` creada.

```powershell
dotnet run --project .\Backend\MicroservicioUsuarios\MicroservicioUsuarios.csproj
```

| Clave | Uso |
| --- | --- |
| `ConnectionStrings:Usuarios_DB` | Cadena de conexión a SQL Server y a `Usuarios_DB`. |
| `Servicios:LoginUrl` | URL base de MicroservicioLogin; el servicio invoca `validate`. |
| `Servicios:BitacoraUrl` | URL base de MicroservicioBitacoras; el servicio invoca `bitacora`. |
| `Servicios:ParametroUrl` | URL base de MicroservicioParametros; el servicio invoca `api/parametro/{code}` para obtener los dominios válidos. |
| `Servicios:RolUrl` | URL base de MicroservicioRoles; el servicio invoca `rol/{id}` para validar que el rol exista. |

## Persistencia y componentes

Los datos se guardan en `Usuarios_DB.dbo.Usuarios`, con llaves foráneas hacia `Roles` y `TiposIdentificacion`. La persistencia usa Dapper.

Flujo principal: endpoints HTTP -> validación de token y de usuario -> `UsuarioService` -> `UsuarioRepository` -> SQL Server.