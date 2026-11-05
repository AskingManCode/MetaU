# Microservicio de Cursos - ACD3

Servicio REST para administrar los cursos que pertenecen a las carreras en MetaU.

## Historia de usuario

**ACD3** — Servicio para Administrar Cursos.

Permite crear, modificar, eliminar (lógicamente) y consultar cursos asociados a una carrera, incluyendo nivel académico.

## Tecnologías

- .NET 10
- ASP.NET Core Minimal APIs
- Dapper (SQL directo) sobre SQL Server
- Autenticación mediante Bearer Token (MicroservicioLogin)
- Registro de acciones en Bitácoras
- Consulta de parámetros para paginación

## Endpoint base

`/curso`

**URL base en producción:**  
`https://tiusr20pl.cuc-carrera-ti.ac.cr/MicroservicioCursos_MetaU`

**URLs locales** (desde `Properties/launchSettings.json`):

- HTTP: `http://localhost:5146`
- HTTPS: `https://localhost:7136`

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
| POST | `/curso` | Crear un curso | 201 Created |
| PUT | `/curso/{cursoCode}` | Modificar un curso | 200 OK |
| DELETE | `/curso/{cursoCode}` | Eliminar un curso (eliminación lógica) | 200 OK |
| GET | `/curso` | Obtener todos los cursos activos | 200 OK |
| GET | `/curso?pagina={n}` | Obtener cursos paginados | 200 OK |
| GET | `/curso/{cursoCode}` | Obtener un curso por código | 200 OK |
| GET | `/curso/carrera/{carreraCode}` | Obtener cursos de una carrera | 200 OK |
| GET | `/curso/carrera/{carreraCode}?pagina={n}` | Cursos de una carrera paginados | 200 OK |

### POST /curso — Crear

```http
POST /curso
Authorization: Bearer <JWT>
X-Usuario-Id: 00000000-0000-0000-0000-000000000001
Content-Type: application/json

{
  "cursoCode": "TI-101",
  "carreraCode": "TI",
  "nombre": "Programacion Uno",
  "nivel": 1
}
```

**Respuesta exitosa (`201 Created`):** el objeto `Curso` creado (con `estado: true`).

### PUT /curso/{cursoCode} — Modificar

El `cursoCode` de la ruta debe coincidir con el del body.

```http
PUT /curso/TI-101
Authorization: Bearer <JWT>
X-Usuario-Id: 00000000-0000-0000-0000-000000000001
Content-Type: application/json

{
  "cursoCode": "TI-101",
  "carreraCode": "TI",
  "nombre": "Programacion I",
  "nivel": 1
}
```

**Respuesta:** `200 OK` con el objeto actualizado.

### DELETE /curso/{cursoCode} — Eliminar

Eliminación lógica.

```http
DELETE /curso/TI-101
Authorization: Bearer <JWT>
X-Usuario-Id: 00000000-0000-0000-0000-000000000001
```

**Respuesta:** `200 OK` con el objeto eliminado.

### GET /curso y GET /curso/{cursoCode}

```http
GET /curso
GET /curso/TI-101
Authorization: Bearer <JWT>
X-Usuario-Id: 00000000-0000-0000-0000-000000000001
```

### GET /curso/carrera/{carreraCode}

```http
GET /curso/carrera/TI
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
  "totalRegistros": 12,
  "totalPaginas": 1,
  "datos": [ ... ]
}
```

## Formato de datos

```json
{
  "cursoCode": "TI-101",
  "carreraCode": "TI",
  "nombre": "Programacion Uno",
  "nivel": 1,
  "estado": true
}
```

## Reglas de negocio / Validaciones

- Todos los campos son obligatorios (`cursoCode`, `carreraCode`, `nombre`, `nivel`).
- El `nombre` solo puede contener letras y espacios.
- El `nivel` debe estar entre 1 y 12.
- El `cursoCode` debe ser único.
- En modificación, el `cursoCode` de la ruta debe coincidir con el del body.
- La carrera debe existir (validación por integridad referencial).
- La eliminación es lógica.
- Solo se consultan cursos activos.

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

**Base de datos:** `Oferta_Academica_DB` (compartida con Instituciones, Carreras y otros).  
Tabla principal: Cursos.

## Ejecución local

```bash
dotnet run --project Backend/MicroservicioCursos/MicroservicioCursos.csproj
```

## Respuestas y errores comunes

| Código | Cuándo ocurre |
|--------|---------------|
| 200 OK | Consulta, modificación o eliminación exitosa |
| 201 Created | Curso creado |
| 400 Bad Request | Datos inválidos, campos vacíos, nombre con caracteres no permitidos, nivel fuera de rango, página < 1 o `cursoCode` no coincide |
| 401 Unauthorized | Token ausente o inválido |
| 404 Not Found | Curso no encontrado |
| 409 Conflict | Ya existe un curso con el mismo código |
| 500 Internal Server Error | Error técnico no controlado |

## Diagrama de clases

![Diagrama de Clases Cursos](../../Documentacion/Diagramas%20Generales/Clases/Microservicios/DiagramaClases_AdministracionCursos.drawio.png)

---

*Documentación estandarizada del microservicio MicroservicioCursos (ACD3).*
