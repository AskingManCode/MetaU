# Microservicio de Períodos - ACD5

Microservicio encargado de la administración de los períodos académicos de MetaU.

## Historia de usuario

**ACD5** — Administración de períodos.

Permite crear, modificar, eliminar y consultar períodos académicos, validando la autenticación e integrando el registro de acciones mediante bitácoras.

## Tecnologías

- .NET 10
- ASP.NET Core Minimal APIs
- SQL Server (`Microsoft.Data.SqlClient`)
- Autenticación mediante ****** (MicroservicioLogin)
- Registro de acciones en Bitácoras
- Consulta de parámetros para paginación

## Endpoint base

`/periodo`

**URL base en producción:**  
`https://tiusr20pl.cuc-carrera-ti.ac.cr/MicroservicioPeriodos_MetaU`

**URLs locales** (desde `Properties/launchSettings.json`):

- HTTP: `http://localhost:5205`
- HTTPS: `https://localhost:7256`

## Autenticación

Todas las operaciones requieren los siguientes headers:

| Header | Valor | Descripción |
|--------|-------|-------------|
| `Authorization` | `******` | Token emitido por MicroservicioLogin |
| `X-Usuario-Id` | `<GUID>` | Identificador del usuario que realiza la operación |

El token se valida contra `POST /validate` de Login.  
Sin token o token inválido → `401 Unauthorized`.  
Si falta `X-Usuario-Id` o no es un GUID válido distinto de vacío → `400 Bad Request`.

## Endpoints

| Método | Ruta | Descripción | Respuesta exitosa |
|--------|------|-------------|-------------------|
| POST | `/periodo` | Crear un período | 201 Created |
| PUT | `/periodo/{periodoID}` | Modificar un período | 200 OK |
| DELETE | `/periodo/{periodoID}` | Eliminar un período | 200 OK |
| GET | `/periodo` | Obtener todos los períodos | 200 OK |
| GET | `/periodo?pagina={n}` | Obtener períodos paginados | 200 OK |
| GET | `/periodo/{periodoID}` | Obtener un período por ID | 200 OK |

`periodoID` debe ser un GUID válido.

### POST /periodo — Crear

```http
POST /periodo
Authorization: ******
X-Usuario-Id: 00000000-0000-0000-0000-000000000001
Content-Type: application/json

{
  "anio": 2028,
  "numeroPeriodo": 1,
  "fechaInicio": "2028-01-10",
  "fechaFin": "2028-04-30"
}
```

**Respuesta exitosa (`201 Created`):** el período creado, con `periodoID` y `estado: true`.

### PUT /periodo/{periodoID} — Modificar

El ID del período se indica en la ruta. El estado actual del registro se conserva.

```http
PUT /periodo/7285dd45-94bf-f111-a104-f44ee3f03ff7
Authorization: ******
X-Usuario-Id: 00000000-0000-0000-0000-000000000001
Content-Type: application/json

{
  "anio": 2028,
  "numeroPeriodo": 1,
  "fechaInicio": "2028-01-15",
  "fechaFin": "2028-05-01"
}
```

**Respuesta:** `200 OK` con el período actualizado o `404 Not Found` si no existe.

### DELETE /periodo/{periodoID} — Eliminar

La eliminación es física: el registro se elimina de la base de datos.

```http
DELETE /periodo/7285dd45-94bf-f111-a104-f44ee3f03ff7
Authorization: ******
X-Usuario-Id: 00000000-0000-0000-0000-000000000001
```

**Respuesta:** `200 OK` con los datos del período eliminado o `404 Not Found` si no existe.

### GET /periodo y GET /periodo/{periodoID}

```http
GET /periodo
GET /periodo/7285dd45-94bf-f111-a104-f44ee3f03ff7
Authorization: ******
X-Usuario-Id: 00000000-0000-0000-0000-000000000001
```

La consulta de la colección devuelve todos los períodos, incluidos los inactivos. La consulta individual responde `200 OK` o `404 Not Found`.

### Paginación

Agregar `?pagina=1` (valor ≥ 1). El tamaño de página se obtiene del parámetro `PAGSIZE` (por defecto **15**, nunca superior a 15). Si el parámetro no está disponible o no contiene un entero positivo, se utiliza el valor por defecto. Los períodos se ordenan por año descendente, número de período ascendente y, en caso de empate, por ID.

```http
GET /periodo?pagina=1
Authorization: ******
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
      "periodoID": "7285dd45-94bf-f111-a104-f44ee3f03ff7",
      "anio": 2028,
      "numeroPeriodo": 1,
      "fechaInicio": "2028-01-10T00:00:00",
      "fechaFin": "2028-04-30T00:00:00",
      "estado": true
    }
  ]
}
```

## Formato de datos

```json
{
  "periodoID": "7285dd45-94bf-f111-a104-f44ee3f03ff7",
  "anio": 2028,
  "numeroPeriodo": 1,
  "fechaInicio": "2028-01-10T00:00:00",
  "fechaFin": "2028-04-30T00:00:00",
  "estado": true
}
```

## Reglas de negocio / Validaciones

- `anio` y `numeroPeriodo` son obligatorios; el año debe ser igual o posterior a 1976 y el número de período debe ser mayor que 0.
- `fechaInicio` y `fechaFin` son obligatorias.
- `fechaFin` debe ser posterior a `fechaInicio`.
- La combinación de `anio` y `numeroPeriodo` debe ser única.
- Al modificar, el período debe existir y se conserva su estado actual.
- Al eliminar, el registro se elimina físicamente.
- Para paginar, `pagina` debe ser mayor o igual a 1.

## Integraciones

| Servicio | Uso |
|----------|-----|
| Login (USR5) | Validar token JWT |
| Bitácoras (GEN1) | Registrar operaciones |
| Parámetros | Obtener `PAGSIZE` para paginación |

## Configuración

Claves principales en `appsettings.json` / variables de entorno:

- `ConnectionStrings:OfertaAcademica` → Cadena de conexión a `Oferta_Academica_DB`.
- `Servicios:LoginUrl` → URL base de MicroservicioLogin.
- `Servicios:BitacoraUrl` → URL base de MicroservicioBitacoras.
- `Servicios:ParametroUrl` → URL base de MicroservicioParametros.
- `Cors:AllowedOrigins` → Orígenes permitidos para CORS.

> **Nota de seguridad:** No versionar contraseñas ni credenciales. Usar variables de entorno o secretos de Plesk en producción.

## Base de datos

**Base de datos:** `Oferta_Academica_DB`  
Tabla principal: Periodos.  
Usa procedimientos almacenados (`usp_Periodo_Crear`, `usp_Periodo_Modificar`, `usp_Periodo_Eliminar`, `usp_Periodo_ObtenerTodos` y `usp_Periodo_ObtenerPorId`).

## Ejecución local

```bash
dotnet run --project Backend/MicroservicioPeriodos/MicroservicioPeriodos.csproj
```

## Respuestas y errores comunes

| Código | Cuándo ocurre |
|--------|---------------|
| 200 OK | Consulta, modificación o eliminación exitosa |
| 201 Created | Período creado |
| 400 Bad Request | Campos requeridos o fechas inválidas, usuario ausente/inválido o página < 1 |
| 401 Unauthorized | Token ausente o inválido |
| 404 Not Found | Período no encontrado |
| 409 Conflict | Ya existe un período con el mismo año y número |
| 500 Internal Server Error | Error técnico no controlado o restricción de base de datos incumplida |

## Diagrama de clases

![Diagrama de Clases Períodos](../../Documentacion/Diagramas%20Generales/Clases/Microservicios/DiagramaClases_AdministracionPeriodos.png)

---

*Documentación estandarizada del microservicio MicroservicioPeriodos (ACD5).*
