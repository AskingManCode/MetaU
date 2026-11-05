# Microservicio de Grupos - ACD4

Microservicio encargado de la administración de grupos académicos.

## Historia de usuario

**ACD4** — Administración de Grupos.

Permite crear, modificar, eliminar (lógicamente) y consultar grupos, validando autenticación e integrando el registro de acciones mediante bitácoras.

## Tecnologías

- .NET 10
- ASP.NET Core Minimal APIs
- SQL Server (`Microsoft.Data.SqlClient`)
- Autenticación mediante Bearer Token (MicroservicioLogin)
- Registro de acciones en Bitácoras
- Consulta de parámetros para paginación

## Endpoint base

`/grupo`

**URL base en producción:**  
`https://tiusr20pl.cuc-carrera-ti.ac.cr/MicroservicioGrupos_MetaU`

**URLs locales** (desde `Properties/launchSettings.json`):

- HTTP: `http://localhost:5077`
- HTTPS: `https://localhost:7157`

## Autenticación

Todas las operaciones requieren los siguientes headers:

| Header | Valor | Descripción |
|--------|-------|-------------|
| `Authorization` | `Bearer <JWT>` | Token emitido por MicroservicioLogin |
| `X-Usuario-Id` | `<GUID>` | Identificador del usuario que realiza la operación |

El token se valida contra `POST /validate` de Login.  
Sin token o token inválido → `401 Unauthorized`.  
Si falta `X-Usuario-Id` o no es un GUID válido → `401 Unauthorized`.

## Endpoints

| Método | Ruta | Descripción | Respuesta exitosa |
|--------|------|-------------|-------------------|
| POST | `/grupo` | Crear un grupo | 201 Created |
| PUT | `/grupo/{grupoCode}` | Modificar un grupo | 200 OK |
| DELETE | `/grupo/{grupoCode}` | Eliminar un grupo (lógicamente) | 200 OK |
| GET | `/grupo` | Obtener todos los grupos | 200 OK |
| GET | `/grupo?pagina={n}` | Obtener grupos paginados | 200 OK |
| GET | `/grupo/{grupoCode}` | Obtener un grupo por código | 200 OK |

### POST /grupo — Crear

```http
POST /grupo
Authorization: Bearer <JWT>
X-Usuario-Id: 00000000-0000-0000-0000-000000000001
Content-Type: application/json

{
  "grupoCode": "GRP001",
  "numeroGrupo": 1,
  "cursoCode": "CURSOTEST",
  "profesorID": "6D76980F-15C0-F111-A105-F44EE3F03FF7",
  "horario": "Lunes 18:00-21:00",
  "cupo": 30,
  "periodoID": "D3282E06-49BD-F111-A101-F44EE3F03FF7"
}
```

**Respuesta exitosa (`201 Created`):** el objeto `Grupo` creado (con `estado: true`).

### PUT /grupo/{grupoCode} — Modificar

El `grupoCode` de la ruta debe coincidir con el del body.

```http
PUT /grupo/GRP001
Authorization: Bearer <JWT>
X-Usuario-Id: 00000000-0000-0000-0000-000000000001
Content-Type: application/json

{
  "grupoCode": "GRP001",
  "numeroGrupo": 1,
  "cursoCode": "CURSOTEST",
  "profesorID": "6D76980F-15C0-F111-A105-F44EE3F03FF7",
  "horario": "Martes 18:00-21:00",
  "cupo": 35,
  "periodoID": "D3282E06-49BD-F111-A101-F44EE3F03FF7"
}
```

### DELETE /grupo/{grupoCode} — Eliminar

Eliminación lógica.

```http
DELETE /grupo/GRP001
Authorization: Bearer <JWT>
X-Usuario-Id: 00000000-0000-0000-0000-000000000001
```

**Respuesta:** `200 OK` con el objeto eliminado.

### GET /grupo y GET /grupo/{grupoCode}

```http
GET /grupo
GET /grupo/GRP001
Authorization: Bearer <JWT>
X-Usuario-Id: 00000000-0000-0000-0000-000000000001
```

### Paginación

Agregar `?pagina=1` (valor ≥ 1). El tamaño de página se obtiene del parámetro `PAGSIZE` (por defecto **15**, nunca superior a 15).

## Formato de datos

```json
{
  "grupoCode": "GRP001",
  "numeroGrupo": 1,
  "cursoCode": "CURSOTEST",
  "profesorID": "6D76980F-15C0-F111-A105-F44EE3F03FF7",
  "horario": "Lunes 18:00-21:00",
  "cupo": 30,
  "periodoID": "D3282E06-49BD-F111-A101-F44EE3F03FF7",
  "estado": true
}
```

## Reglas de negocio / Validaciones

- Todos los campos son obligatorios (`grupoCode`, `numeroGrupo` > 0, `cursoCode`, `profesorID` ≠ vacío, `horario`, `cupo` > 0, `periodoID` ≠ vacío).
- El `grupoCode` debe ser único.
- No puede existir más de un grupo con la misma combinación de `cursoCode`, `periodoID` y `numeroGrupo`.
- En modificación, el `grupoCode` de la ruta debe coincidir con el del body.
- Las relaciones con curso, profesor y período se validan mediante integridad referencial en base de datos.
- La eliminación es lógica.

## Integraciones

| Servicio | Uso |
|----------|-----|
| Login (USR5) | Validar token JWT |
| Bitácoras (GEN1) | Registrar operaciones (mejor esfuerzo) |
| Parámetros | Obtener `PAGSIZE` para paginación |

## Configuración

Claves principales en `appsettings.json` / variables de entorno:

- `ConnectionStrings:OfertaAcademica` → Cadena de conexión a `Oferta_Academica_DB`.
- `Servicios:LoginUrl` → URL base de MicroservicioLogin.
- `Servicios:BitacoraUrl` → URL base de MicroservicioBitacoras.
- `Servicios:ParametroUrl` → URL base de MicroservicioParametros.

> **Nota de seguridad:** No versionar contraseñas ni credenciales. Usar variables de entorno o secretos de Plesk en producción.

## Base de datos

**Base de datos:** `Oferta_Academica_DB`  
Tabla principal: Grupos.

## Ejecución local

```bash
dotnet run --project Backend/MicroservicioGrupos/MicroservicioGrupos.csproj
```

## Respuestas y errores comunes

| Código | Cuándo ocurre |
|--------|---------------|
| 200 OK | Consulta, modificación o eliminación exitosa |
| 201 Created | Grupo creado |
| 400 Bad Request | Datos inválidos, campos vacíos, `grupoCode` no coincide o página < 1 |
| 401 Unauthorized | Token o `X-Usuario-Id` ausente/inválido |
| 404 Not Found | Grupo no encontrado |
| 409 Conflict | Grupo duplicado (código o combinación curso/período/número) |
| 500 Internal Server Error | Error técnico no controlado |

## Diagrama de clases

![Diagrama de Clases Grupos](../../Documentacion/Diagramas%20Generales/Clases/Microservicios/DiagramaClases_AdministracionGrupos.png)

---

*Documentación estandarizada del microservicio MicroservicioGrupos (ACD4).*
