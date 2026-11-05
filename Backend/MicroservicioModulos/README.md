# Microservicio de Módulos - USR1

Administra el catálogo de módulos de MetaU. Cada módulo tiene un código único, un nombre, un estado y un orden.

## Historia de usuario

**USR1** — Administración de Módulos.

## Tecnologías

- .NET 10
- ASP.NET Core Minimal APIs
- Dapper sobre SQL Server
- Autenticación mediante Bearer Token (MicroservicioLogin)
- Registro de acciones en Bitácoras
- Consulta de parámetros para paginación

## Endpoint base

`/modulo`

**URL base en producción:**  
`https://tiusr20pl.cuc-carrera-ti.ac.cr/MicroservicioModulos_MetaU`

**URLs locales** (desde `Properties/launchSettings.json`):

- HTTP: `http://localhost:5282`
- HTTPS: `https://localhost:7218`

## Autenticación

Todas las operaciones requieren los siguientes headers:

| Header | Valor | Descripción |
|--------|-------|-------------|
| `Authorization` | `Bearer <JWT>` | Token emitido por MicroservicioLogin |
| `X-Usuario-Id` | `<GUID>` | Identificador del usuario que realiza la operación |

El token se valida contra `POST /validate` de Login.  
Sin token o token inválido → `401 Unauthorized`.  
Si falta `X-Usuario-Id` o no es un GUID válido → `400 Bad Request`.

## Endpoints

| Método | Ruta | Descripción | Respuesta exitosa |
|--------|------|-------------|-------------------|
| POST | `/modulo/` | Crear un módulo | 201 Created |
| PUT | `/modulo/{id}` | Actualizar un módulo | 200 OK |
| DELETE | `/modulo/{id}` | Eliminar un módulo | 204 No Content |
| GET | `/modulo/` | Obtener todos los módulos | 200 OK |
| GET | `/modulo/?pagina={n}` | Obtener módulos paginados | 200 OK |
| GET | `/modulo/{id}` | Obtener un módulo por ID | 200 OK |

### POST /modulo/ — Crear

```http
POST /modulo/
Authorization: Bearer <JWT>
X-Usuario-Id: 00000000-0000-0000-0000-000000000001
Content-Type: application/json

{
  "idModulo": "USR",
  "nombre": "Usuarios",
  "estado": true,
  "orden": 1
}
```

**Respuesta exitosa (`201 Created`):** el módulo creado.

### PUT /modulo/{id} — Actualizar

El `id` de la ruta debe coincidir con `idModulo` del body.

```http
PUT /modulo/USR
Authorization: Bearer <JWT>
X-Usuario-Id: 00000000-0000-0000-0000-000000000001
Content-Type: application/json

{
  "idModulo": "USR",
  "nombre": "Administracion de Usuarios",
  "estado": true,
  "orden": 1
}
```

### DELETE /modulo/{id} — Eliminar

```http
DELETE /modulo/USR
Authorization: Bearer <JWT>
X-Usuario-Id: 00000000-0000-0000-0000-000000000001
```

**Respuesta:** `204 No Content`.  
No se puede eliminar si tiene roles asignados.

### GET /modulo/ y GET /modulo/{id}

```http
GET /modulo/
GET /modulo/USR
Authorization: Bearer <JWT>
X-Usuario-Id: 00000000-0000-0000-0000-000000000001
```

### Paginación

Agregar `?pagina=1` (valor ≥ 1). El tamaño de página se obtiene del parámetro `PAGSIZE` (por defecto **15**).

## Formato de datos

```json
{
  "idModulo": "USR",
  "nombre": "Usuarios",
  "estado": true,
  "orden": 1
}
```

## Reglas de negocio / Validaciones

- `idModulo` es obligatorio y solo puede contener letras mayúsculas (1 a 15 caracteres).
- `nombre` es obligatorio y solo puede contener letras y espacios.
- `estado` y `orden` son obligatorios.
- `orden` debe ser ≥ 1 y único.
- El `idModulo` debe ser único.
- En actualización, el ID de la ruta debe coincidir con el del body.
- No se puede eliminar un módulo que tenga roles asignados.

## Integraciones

| Servicio | Uso |
|----------|-----|
| Login (USR5) | Validar token JWT |
| Bitácoras (GEN1) | Registrar operaciones (mejor esfuerzo) |
| Parámetros | Obtener `PAGSIZE` para paginación |

## Configuración

Claves principales en `appsettings.json` / variables de entorno:

- `ConnectionStrings:UsuariosDb` → Cadena de conexión a `Usuarios_DB`.
- `Servicios:LoginUrl` → URL base de MicroservicioLogin.
- `Servicios:BitacoraUrl` → URL base de MicroservicioBitacoras.
- `Servicios:ParametroUrl` → URL base de MicroservicioParametros.

> **Nota de seguridad:** No versionar contraseñas ni credenciales. Usar variables de entorno o secretos de Plesk en producción.

## Base de datos

**Base de datos:** `Usuarios_DB`  
Tabla principal: `Modulos` (`ModuloCode` como clave primaria).

## Ejecución local

```bash
dotnet run --project Backend/MicroservicioModulos/MicroservicioModulos.csproj
```

## Respuestas y errores comunes

| Código | Cuándo ocurre |
|--------|---------------|
| 200 OK | Consulta o actualización exitosa |
| 201 Created | Módulo creado |
| 204 No Content | Módulo eliminado |
| 400 Bad Request | Datos inválidos, campos vacíos, ID/nombre con formato incorrecto o `X-Usuario-Id` inválido |
| 401 Unauthorized | Token ausente o inválido |
| 404 Not Found | Módulo no encontrado |
| 409 Conflict | Ya existe un módulo con el mismo ID u orden, o no se puede eliminar porque tiene roles asignados |
| 500 Internal Server Error | Error técnico no controlado |

## Diagrama de clases

![Diagrama de Clases Módulos](../../Documentacion/Diagramas%20Generales/Clases/Microservicios/DiagramaClases_AdministracionModulos.png)

---

*Documentación estandarizada del microservicio MicroservicioModulos (USR1).*
