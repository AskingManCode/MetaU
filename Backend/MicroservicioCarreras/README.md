# Microservicio de Carreras - ACD2

Servicio REST para administrar las carreras que ofrecen las instituciones en MetaU.

## Historia de usuario

**ACD2** — Servicio para Administrar Carreras.

Permite crear, modificar, eliminar (lógicamente) y consultar carreras, asociadas a una institución y a un director (profesor).

## Tecnologías

- .NET 10
- ASP.NET Core Minimal APIs
- Dapper (SQL directo) sobre SQL Server
- Autenticación mediante Bearer Token (MicroservicioLogin)
- Registro de acciones en Bitácoras
- Consulta de parámetros para paginación

## Endpoint base

`/carrera`

**URL base en producción:**  
`https://tiusr20pl.cuc-carrera-ti.ac.cr/MicroservicioCarreras_MetaU`

**URLs locales** (desde `Properties/launchSettings.json`):

- HTTP: `http://localhost:5108`
- HTTPS: `https://localhost:7016`

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
| POST | `/carrera` | Crear una carrera | 201 Created |
| PUT | `/carrera/{id}` | Modificar una carrera | 200 OK |
| DELETE | `/carrera/{id}` | Eliminar una carrera (eliminación lógica) | 204 No Content |
| GET | `/carrera` | Obtener todas las carreras activas | 200 OK |
| GET | `/carrera?pagina={n}` | Obtener carreras paginadas | 200 OK |
| GET | `/carrera/{id}` | Obtener una carrera por código | 200 OK |
| GET | `/carrera/institucion/{institucionId}` | Obtener carreras de una institución | 200 OK |
| GET | `/carrera/institucion/{institucionId}?pagina={n}` | Carreras de una institución paginadas | 200 OK |

### POST /carrera — Crear

```http
POST /carrera
Authorization: Bearer <JWT>
X-Usuario-Id: 00000000-0000-0000-0000-000000000001
Content-Type: application/json

{
  "carreraCode": "TI",
  "institucionCode": "CUC",
  "directorID": "00000000-0000-0000-0000-000000000010",
  "nombre": "Tecnologias de la Informacion"
}
```

**Respuesta exitosa (`201 Created`):** el objeto `Carrera` creado (con `estado: true`).

### PUT /carrera/{id} — Modificar

Solo se pueden modificar el `nombre` y el `directorID`. El código y la institución no cambian.

```http
PUT /carrera/TI
Authorization: Bearer <JWT>
X-Usuario-Id: 00000000-0000-0000-0000-000000000001
Content-Type: application/json

{
  "nombre": "Tecnologias de la Informacion y Comunicacion",
  "directorID": "00000000-0000-0000-0000-000000000010"
}
```

**Respuesta:** `200 OK` con el objeto actualizado.

### DELETE /carrera/{id} — Eliminar

Eliminación lógica (`Estado = false`).

```http
DELETE /carrera/TI
Authorization: Bearer <JWT>
X-Usuario-Id: 00000000-0000-0000-0000-000000000001
```

**Respuesta:** `204 No Content`.

### GET /carrera y GET /carrera/{id}

```http
GET /carrera
GET /carrera/TI
Authorization: Bearer <JWT>
X-Usuario-Id: 00000000-0000-0000-0000-000000000001
```

### GET /carrera/institucion/{institucionId}

```http
GET /carrera/institucion/CUC
Authorization: Bearer <JWT>
X-Usuario-Id: 00000000-0000-0000-0000-000000000001
```

### Paginación

Agregar `?pagina=1` (valor ≥ 1). El tamaño de página se obtiene del parámetro `PAGSIZE` (por defecto **15**).

**Respuesta paginada:**

```json
{
  "pagina": 1,
  "tamanoPagina": 15,
  "totalRegistros": 8,
  "totalPaginas": 1,
  "datos": [ ... ]
}
```

## Formato de datos

```json
{
  "carreraCode": "TI",
  "institucionCode": "CUC",
  "directorID": "00000000-0000-0000-0000-000000000010",
  "nombre": "Tecnologias de la Informacion",
  "estado": true
}
```

## Reglas de negocio / Validaciones

- Todos los campos son obligatorios (`carreraCode`, `institucionCode`, `directorID`, `nombre`).
- El `nombre` solo puede contener letras y espacios.
- El `carreraCode` debe ser único.
- El `directorID` no puede ser vacío (`Guid.Empty`).
- La institución debe existir (validación por integridad referencial en base de datos).
- El director debe existir como profesor (validación por llave foránea, ya que Instituciones, Carreras y Profesores comparten `Oferta_Academica_DB`).
- La eliminación es lógica (`Estado = false`).
- Solo se consultan carreras activas.

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
- `Servicios:BitacorasUrl` → URL base de MicroservicioBitacoras.
- `Servicios:ParametroUrl` → URL base de MicroservicioParametros.

> **Nota de seguridad:** No versionar contraseñas ni credenciales. Usar variables de entorno o secretos de Plesk en producción.

## Base de datos

**Base de datos:** `Oferta_Academica_DB` (compartida con Instituciones y Profesores).  
Tabla principal: Carreras.

## Ejecución local

```bash
dotnet run --project Backend/MicroservicioCarreras/MicroservicioCarreras.csproj
```

## Respuestas y errores comunes

| Código | Cuándo ocurre |
|--------|---------------|
| 200 OK | Consulta o modificación exitosa |
| 201 Created | Carrera creada |
| 204 No Content | Carrera eliminada (lógicamente) |
| 400 Bad Request | Datos inválidos, campos vacíos, nombre con caracteres no permitidos o página < 1 |
| 401 Unauthorized | Token ausente o inválido |
| 404 Not Found | Carrera no encontrada o inactiva |
| 409 Conflict | Ya existe una carrera con el mismo código |
| 500 Internal Server Error | Error técnico no controlado |

## Diagrama de clases

![Diagrama de Clases Carreras](../../Documentacion/Diagramas%20Generales/Clases/Microservicios/DiagramaClases-Carreras.drawio.png)

---

*Documentación estandarizada del microservicio MicroservicioCarreras (ACD2).*
