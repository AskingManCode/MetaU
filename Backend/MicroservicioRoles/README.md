# Microservicio de Roles

Microservicio encargado de la administración de roles y de sus permisos sobre los módulos de MetaU.

## Historia de usuario

**USR2** — Administración de roles.

Permite crear, modificar, eliminar y consultar roles, así como consultar y actualizar los permisos de cada rol sobre los módulos del sistema.

## Tecnologías

- .NET 10
- ASP.NET Core Minimal APIs
- Dapper sobre SQL Server
- Autenticación mediante JWT (MicroservicioLogin)
- Registro de acciones en Bitácoras
- Consulta de parámetros para paginación

## Endpoint base

`/rol`

**URL base en producción:**  
`https://tiusr20pl.cuc-carrera-ti.ac.cr/MicroservicioRoles_MetaU`

**URLs locales** (desde `Properties/launchSettings.json`):

- HTTP: `http://localhost:5278`
- HTTPS: `https://localhost:7205`

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
| GET | `/rol/` | Obtener todos los roles | 200 OK |
| GET | `/rol/?pagina={n}` | Obtener roles paginados | 200 OK |
| GET | `/rol/{id}` | Obtener un rol por código | 200 OK |
| POST | `/rol/` | Crear un rol | 201 Created |
| PUT | `/rol/{id}` | Modificar un rol | 200 OK |
| DELETE | `/rol/{id}` | Eliminar un rol físicamente | 204 No Content |
| GET | `/rol/{id}/modulos` | Consultar los módulos y permisos del rol | 200 OK |
| PUT | `/rol/{id}/modulos` | Actualizar permisos del rol para módulos | 200 OK |

`id` corresponde al código del rol; no es un GUID.

### POST /rol/ — Crear

```http
POST /rol/
Authorization: Bearer token-de-ejemplo
X-Usuario-Id: 00000000-0000-0000-0000-000000000001
Content-Type: application/json

{
  "idRol": "EST",
  "nombre": "Estudiante"
}
```

Responde `201 Created` con el rol creado y un header `Location` que apunta a `/rol/{idRol}`. Si el código o el nombre ya existen, responde `409 Conflict`.

### PUT /rol/{id} — Modificar

El `idRol` del cuerpo debe coincidir, sin distinguir mayúsculas y minúsculas, con el código de la ruta. El código no se modifica; solo se actualiza el nombre.

```http
PUT /rol/EST
Authorization: Bearer token-de-ejemplo
X-Usuario-Id: 00000000-0000-0000-0000-000000000001
Content-Type: application/json

{
  "idRol": "EST",
  "nombre": "Estudiante Regular"
}
```

Responde `200 OK` con el rol actualizado, `400 Bad Request` si el código de ruta y cuerpo no coinciden o los datos no son válidos, `404 Not Found` si el rol no existe y `409 Conflict` si el nombre ya está en uso.

### DELETE /rol/{id} — Eliminar

La eliminación es física.

```http
DELETE /rol/EST
Authorization: Bearer token-de-ejemplo
X-Usuario-Id: 00000000-0000-0000-0000-000000000001
```

Responde `204 No Content` o `404 Not Found` si el rol no existe. Si existen registros relacionados que impiden el borrado, se responde `500 Internal Server Error`.

### GET /rol/ y GET /rol/{id} — Consultar

```http
GET /rol/
GET /rol/EST
Authorization: Bearer token-de-ejemplo
X-Usuario-Id: 00000000-0000-0000-0000-000000000001
```

La consulta de la colección devuelve todos los roles. La consulta individual responde `200 OK` o `404 Not Found`.

### Paginación

Agregar `?pagina=1` (valor ≥ 1). El tamaño de página se obtiene del parámetro `PAGSIZE` (por defecto **15**). Si el parámetro no está disponible o no contiene un entero positivo, se utiliza el valor por defecto.

```http
GET /rol/?pagina=1
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
      "idRol": "EST",
      "nombre": "Estudiante"
    }
  ]
}
```

### GET /rol/{id}/modulos — Consultar permisos

Devuelve todos los módulos y el estado del permiso asociado al rol. `estado: true` indica que el permiso está habilitado; `estado: false` indica que no está habilitado.

```http
GET /rol/EST/modulos
Authorization: Bearer token-de-ejemplo
X-Usuario-Id: 00000000-0000-0000-0000-000000000001
```

Ejemplo de respuesta:

```json
[
  {
    "idModulo": "MODULO1",
    "nombre": "Modulo de ejemplo",
    "estado": true
  }
]
```

Responde `404 Not Found` si el rol no existe.

### PUT /rol/{id}/modulos — Actualizar permisos

Recibe una lista no vacía de módulos. Para cada módulo indicado, actualiza o crea la relación con el estado enviado; los módulos omitidos no se modifican. No se permiten módulos repetidos en la solicitud.

```http
PUT /rol/EST/modulos
Authorization: Bearer token-de-ejemplo
X-Usuario-Id: 00000000-0000-0000-0000-000000000001
Content-Type: application/json

[
  {
    "idModulo": "MODULO1",
    "estado": true
  },
  {
    "idModulo": "MODULO2",
    "estado": false
  }
]
```

Responde `200 OK` con los permisos actualizados, `400 Bad Request` si la lista está vacía o contiene módulos repetidos y `404 Not Found` si el rol o alguno de los módulos no existe.

## Formato de datos

```json
{
  "idRol": "EST",
  "nombre": "Estudiante"
}
```

Los códigos usados en los ejemplos son ilustrativos y deben sustituirse por códigos existentes en el ambiente.

## Reglas de negocio / Validaciones

- `idRol` y `nombre` son obligatorios al crear un rol.
- `idRol` debe contener entre 1 y 15 letras mayúsculas (`A-Z`) y es único.
- `nombre` debe contener solo letras y espacios, admite hasta 75 caracteres y es único. La base de datos rechaza espacios al inicio o al final y secuencias de espacios repetidos.
- Al modificar, el código de la ruta y el del cuerpo deben coincidir; no se cambia el código del rol.
- La eliminación es física.
- La consulta de permisos requiere un rol existente y devuelve todos los módulos, incluidos aquellos cuyo permiso no está habilitado.
- La actualización de permisos requiere una lista con al menos un módulo, sin códigos repetidos; cada módulo debe existir. Solo cambia el estado de los módulos indicados.
- Para paginar, `pagina` debe ser mayor o igual a 1.

## Integraciones

| Servicio | Uso |
|----------|-----|
| Login (USR5) | Validar token JWT |
| Bitácoras (GEN1) | Registrar operaciones (mejor esfuerzo ante errores HTTP) |
| Parámetros | Obtener `PAGSIZE` para paginación |

El token se propaga a los servicios integrados que lo requieren. El identificador de usuario se envía como `X-Usuario-Id` a Bitácoras y como `UsuarioGUID` al consultar Parámetros. Las fallas HTTP al registrar una bitácora se capturan y no impiden completar la operación principal.

## Configuración

Claves principales en `appsettings.json` / variables de entorno:

- `ConnectionStrings:UsuariosDB` → Cadena de conexión a `tiusr20pl_Usuarios_DB` en producción.
- `Servicios:LoginUrl` → URL base de MicroservicioLogin.
- `Servicios:BitacoraUrl` → URL base de MicroservicioBitacoras.
- `Servicios:ParametroUrl` → URL base de MicroservicioParametros.

> **Nota de seguridad:** No versionar contraseñas ni credenciales. Usar variables de entorno o secretos de Plesk en producción.

## Base de datos

**Base de datos:** `tiusr20pl_Usuarios_DB`.  
Tablas utilizadas, dentro del esquema `MetaU_DB_User`: `Roles` (`RolCode` como clave primaria y `NombreRol` único), `Modulos` y `RolesXModulos`. Esta última registra el estado del permiso y tiene una relación única por rol y módulo.  
La persistencia se realiza con Dapper y consultas SQL directas; este microservicio no utiliza procedimientos almacenados.

## Ejecución local

Requiere .NET 10 y SQL Server con la base de datos y las tablas configuradas.

```powershell
dotnet run --project .\Backend\MicroservicioRoles\MicroservicioRoles.csproj
```

## Respuestas y errores comunes

| Código | Cuándo ocurre |
|--------|---------------|
| 200 OK | Consulta o modificación exitosa |
| 201 Created | Rol creado |
| 204 No Content | Rol eliminado |
| 400 Bad Request | Datos inválidos, código y nombre no permitidos, página < 1, lista de permisos vacía o módulos repetidos, o `X-Usuario-Id` ausente/inválido |
| 401 Unauthorized | Token ausente o inválido |
| 404 Not Found | Rol o módulo no encontrado |
| 409 Conflict | Ya existe un rol con el código o nombre indicado |
| 500 Internal Server Error | Error técnico no controlado o restricción de base de datos incumplida |

## Diagrama de clases

![Diagrama de Clases de Roles](../../Documentacion/Diagramas%20Generales/Clases/Microservicios/DiagramaClases-Roles.png)

---

*Documentación estandarizada del microservicio MicroservicioRoles (USR2).*
