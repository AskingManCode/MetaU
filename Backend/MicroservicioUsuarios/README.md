# Microservicio de Usuarios

Microservicio encargado de la administración de los usuarios de MetaU.

## Historia de usuario

**USR1** — Administración de usuarios.

Permite crear, consultar, filtrar, modificar y eliminar usuarios, validando los dominios de correo permitidos y la relación entre el dominio y el rol asignado.

## Tecnologías

- .NET 10
- ASP.NET Core Minimal APIs
- Dapper sobre SQL Server
- Hash de contraseñas con BCrypt
- Autenticación mediante JWT (MicroservicioLogin)
- Registro de acciones en Bitácoras
- Integración con Parámetros y Roles

## Endpoint base

`/usuario`

**URL base en producción:**  
`https://tiusr20pl.cuc-carrera-ti.ac.cr/MicroservicioUsuarios_MetaU`

**URLs locales** (desde `Properties/launchSettings.json`):

- HTTP: `http://localhost:5152`
- HTTPS: `https://localhost:7030`

## Autenticación

Todas las operaciones requieren los siguientes headers:

| Header | Valor | Descripción |
|--------|-------|-------------|
| `Authorization` | `Bearer token-de-ejemplo` | Token emitido por MicroservicioLogin |
| `X-Usuario-Id` | `<GUID>` | Identificador del usuario que realiza la operación |

El token se valida contra `POST /validate` de Login.  
Sin token o token inválido → `401 Unauthorized`.  
Si falta `X-Usuario-Id` o no es un GUID válido distinto de vacío → `400 Bad Request`.

## Endpoints

| Método | Ruta | Descripción | Respuesta exitosa |
|--------|-------|-------------|-------------------|
| GET | `/usuario/` | Obtener o filtrar usuarios | 200 OK |
| GET | `/usuario/?pagina={n}` | Obtener usuarios paginados, con filtros opcionales | 200 OK |
| GET | `/usuario/{email}` | Obtener un usuario por correo | 200 OK |
| POST | `/usuario/` | Crear un usuario | 201 Created |
| PUT | `/usuario/{email}` | Modificar los datos de un usuario | 200 OK |
| DELETE | `/usuario/{email}` | Eliminar un usuario y sus refresh tokens | 204 No Content |

### POST /usuario/ — Crear

```http
POST /usuario/
Authorization: Bearer token-de-ejemplo
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

Responde `201 Created` con el usuario creado y un header `Location` que apunta a `/usuario/{email}`. Si el correo o la identificación ya existen, responde `409 Conflict`. Los dominios permitidos y el rol deben ser compatibles.

### GET /usuario/ y GET /usuario/{email} — Consultar

```http
GET /usuario/
GET /usuario/juan.perez@cuc.cr
Authorization: Bearer token-de-ejemplo
X-Usuario-Id: 00000000-0000-0000-0000-000000000001
```

La consulta de colección devuelve todos los usuarios, incluidos los inactivos. La consulta individual responde `200 OK` o `404 Not Found`. La contraseña y su hash no se incluyen en las respuestas.

La colección admite los siguientes filtros opcionales, que se pueden combinar:

| Parámetro | Uso |
|-----------|-----|
| `identificacion` | Coincidencia exacta de identificación |
| `nombre` | Búsqueda parcial en el nombre completo |
| `tipo` | Coincidencia exacta del código de tipo de identificación |
| `dominio` | Filtrar por dominio del correo; se puede enviar con o sin `@` inicial |
| `rol` | Coincidencia exacta del código de rol |

Ejemplo:

```http
GET /usuario/?nombre=Juan&tipo=CED&dominio=cuc.cr&rol=EST
Authorization: Bearer token-de-ejemplo
X-Usuario-Id: 00000000-0000-0000-0000-000000000001
```

### Ordenamiento

La colección permite ordenar con `ordenarPor` y `direccion`. Los valores disponibles para `ordenarPor` son `tipo`, `identificacion`, `nombre` y `rol`; si se omite o no coincide con uno de ellos, ordena por correo. `direccion=desc` ordena de forma descendente; cualquier otro valor o su omisión ordena de forma ascendente.

```http
GET /usuario/?ordenarPor=nombre&direccion=desc
Authorization: Bearer token-de-ejemplo
X-Usuario-Id: 00000000-0000-0000-0000-000000000001
```

### PUT /usuario/{email} — Modificar

Los campos del cuerpo se validan de la misma manera que al crear, excepto que la contraseña es opcional. Si no se envía una contraseña no vacía, se conserva el hash existente. El correo se incluye en el cuerpo y se valida, pero no se cambia: el correo de la ruta identifica al usuario y se mantiene el correo existente.

```http
PUT /usuario/juan.perez@cuc.cr
Authorization: Bearer token-de-ejemplo
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

Responde `200 OK` con el usuario actualizado, `400 Bad Request` si los datos o la relación entre dominio y rol no son válidos, `404 Not Found` si el correo de la ruta no existe. Si la identificación ya pertenece a otro usuario, la restricción de unicidad de la base de datos provoca `500 Internal Server Error`.

### DELETE /usuario/{email} — Eliminar

La eliminación es física. En la misma transacción, el servicio elimina primero los refresh tokens asociados al usuario y después elimina el registro de usuario.

```http
DELETE /usuario/juan.perez@cuc.cr
Authorization: Bearer token-de-ejemplo
X-Usuario-Id: 00000000-0000-0000-0000-000000000001
```

Responde `204 No Content` o `404 Not Found` si no existe un usuario con ese correo.

### Paginación

Agregar `?pagina=1` (valor ≥ 1). El tamaño de página se obtiene del parámetro `PAGSIZE` (por defecto **15**). Si el parámetro no está disponible, falla la solicitud HTTP al servicio de parámetros o el valor no es un entero positivo, se utiliza el valor por defecto. Los filtros y el ordenamiento descritos anteriormente se aplican antes de paginar.

```http
GET /usuario/?pagina=1&ordenarPor=nombre&direccion=asc
Authorization: Bearer token-de-ejemplo
X-Usuario-Id: 00000000-0000-0000-0000-000000000001
```

**Respuesta paginada:**

```json
{
  "pagina": 1,
  "tamanoPagina": 15,
  "totalRegistros": 1,
  "totalPaginas": 1,
  "datos": [
    {
      "usuarioId": "11111111-1111-1111-1111-111111111111",
      "rolCode": "EST",
      "tipoIdentificacionCode": "CED",
      "identificacion": "123456789",
      "nombreCompleto": "Juan Perez",
      "email": "juan.perez@cuc.cr",
      "estado": true,
      "fechaModificacion": "2026-11-04T12:00:00"
    }
  ]
}
```

## Formato de datos

El cuerpo de creación y actualización utiliza `tipoIdentificacion`, `nombre` e `idRol`. Las respuestas exponen `tipoIdentificacionCode`, `nombreCompleto` y `rolCode`. `contrasenaHash` se excluye de la serialización.

Ejemplo de respuesta:

```json
{
  "usuarioId": "11111111-1111-1111-1111-111111111111",
  "rolCode": "EST",
  "tipoIdentificacionCode": "CED",
  "identificacion": "123456789",
  "nombreCompleto": "Juan Perez",
  "email": "juan.perez@cuc.cr",
  "estado": true,
  "fechaModificacion": "2026-11-04T12:00:00"
}
```

Los identificadores y datos usados en los ejemplos son ilustrativos y deben sustituirse por datos existentes en el ambiente.

## Reglas de negocio / Validaciones

- Al crear, `email`, `tipoIdentificacion`, `identificacion`, `nombre`, `idRol` y `contrasena` son obligatorios. Al actualizar, la contraseña es opcional.
- El nombre solo puede contener letras y espacios; la base de datos admite hasta 175 caracteres y rechaza el nombre vacío, espacios iniciales o finales y espacios repetidos.
- El correo debe tener formato válido y pertenecer exactamente a `DOMEST` o `DOMPROF`; sus valores iniciales son `cuc.cr` y `cuc.ac.cr`, respectivamente.
- Los correos del dominio `DOMEST` requieren un rol cuyo nombre sea `Estudiante`. Los del dominio `DOMPROF` requieren un rol llamado `Profesor`, `Administrador` o `Administrativo`.
- La identificación debe tener entre 9 y 30 caracteres alfanuméricos, sin espacios, y ser única.
- El correo es único y admite hasta 150 caracteres.
- El código de tipo de identificación debe existir; el esquema admite códigos de 1 a 15 letras mayúsculas. El rol también debe existir y su nombre debe ser compatible con el dominio del correo.
- Al crear, la contraseña se almacena como hash BCrypt; no se devuelve ni se almacena en texto plano.
- Al actualizar, el correo de la ruta se conserva, el estado no cambia y la fecha de modificación se actualiza. La contraseña solo se reemplaza cuando se envía un valor no vacío.
- La eliminación es física y también elimina los refresh tokens asociados.
- Para paginar, `pagina` debe ser mayor o igual a 1.

## Integraciones

| Servicio | Uso |
|----------|-----|
| Login (USR5) | Validar token JWT |
| Bitácoras (GEN1) | Registrar operaciones (mejor esfuerzo ante errores HTTP) |
| Parámetros | Obtener `DOMEST`, `DOMPROF` y `PAGSIZE` |
| Roles (USR2) | Verificar que el rol exista y obtener su nombre |

El token se propaga a los servicios integrados que lo requieren. El identificador de usuario se envía como `X-Usuario-Id` a Bitácoras y Roles, y como `UsuarioGUID` al consultar Parámetros. Las fallas HTTP al registrar una bitácora se capturan y no impiden completar la operación principal.

## Configuración

Claves principales en `appsettings.json` / variables de entorno:

- `ConnectionStrings:UsuariosDB` → Cadena de conexión a `tiusr20pl_Usuarios_DB` en producción.
- `Servicios:LoginUrl` → URL base de MicroservicioLogin.
- `Servicios:BitacoraUrl` → URL base de MicroservicioBitacoras.
- `Servicios:ParametroUrl` → URL base de MicroservicioParametros.
- `Servicios:RolUrl` → URL base de MicroservicioRoles.

> **Nota de seguridad:** No versionar contraseñas ni credenciales. Usar variables de entorno o secretos de Plesk en producción.

## Base de datos

**Base de datos:** `Usuarios_DB`.  
Tablas utilizadas, dentro del esquema `MetaU_DB_User`: `Usuarios`, `Roles`, `TiposIdentificacion` y `RefreshToken`.  
La persistencia se realiza con Dapper y consultas SQL directas; este microservicio no utiliza procedimientos almacenados. Las contraseñas se guardan en `ContrasenaHash`; la eliminación de un usuario elimina sus refresh tokens dentro de una transacción.

## Ejecución local

Requiere .NET 10 y SQL Server con la base de datos y las tablas configuradas.

```powershell
dotnet run --project .\Backend\MicroservicioUsuarios\MicroservicioUsuarios.csproj
```

## Respuestas y errores comunes

| Código | Cuándo ocurre |
|--------|---------------|
| 200 OK | Consulta o actualización exitosa |
| 201 Created | Usuario creado |
| 204 No Content | Usuario eliminado |
| 400 Bad Request | Datos inválidos, correo o dominio no permitido, relación incompatible entre dominio y rol, página < 1 o `X-Usuario-Id` ausente/inválido |
| 401 Unauthorized | Token ausente o inválido |
| 404 Not Found | Usuario no encontrado |
| 409 Conflict | Correo o identificación ya registrados al crear el usuario |
| 500 Internal Server Error | Error técnico no controlado o restricción de base de datos incumplida |

## Diagrama de clases

![Diagrama de Clases de Usuarios](../../Documentacion/Diagramas%20Generales/Clases/Microservicios/DiagramaClases_AdministracionUsuarios.png)

---

*Documentación estandarizada del microservicio MicroservicioUsuarios (USR1).*
