# Microservicio de Facturación

Administra la emisión y anulación de facturas de servicios estudiantiles asociadas a matrículas activas en un período académico.

## Historia de usuario

ADM20 — Emisión y anulación de facturas por servicios estudiantiles ligadas a matrículas activas en un período académico.

## Tecnologías

- .NET 10
- ASP.NET Core Minimal APIs
- Dapper sobre SQL Server
- Autenticación mediante Bearer Token (MicroservicioLogin)
- Registro de acciones en Bitácoras
- Integración con Matrículas y Períodos

## Endpoint base

`/api/factura`

**URL base en producción:**  
`https://tiusr20pl.cuc-carrera-ti.ac.cr/MicroservicioFacturacion_MetaU/api`

**URLs locales** (desde `Properties/launchSettings.json`):

- HTTP: `http://localhost:5173`
- HTTPS: `https://localhost:7227`

## Autenticación

Todas las operaciones requieren los siguientes headers:

| Header | Valor | Descripción |
|--------|-------|-------------|
| `Authorization` | `Bearer <JWT>` | Token emitido por MicroservicioLogin |
| `X-Usuario-Id` | `<GUID>` | Identificador del usuario que realiza la operación |

El token se valida contra `POST /validate` de Login.  
Sin token, token inválido o `X-Usuario-Id` ausente/inválido → `401 Unauthorized`.

## Endpoints

| Método | Ruta | Descripción | Respuesta exitosa |
|--------|------|-------------|-------------------|
| POST | `/api/factura/` | Crear una factura | 201 Created |
| PATCH | `/api/factura/{FacturaID}` | Anular una factura | 200 OK |
| GET | `/api/factura/{FacturaID}` | Obtener una factura por ID | 200 OK |
| GET | `/api/factura/periodo/{PeriodoID}` | Obtener facturas de un período | 200 OK |

### POST /api/factura/ — Crear

```http
POST /api/factura/
Authorization: Bearer <JWT>
X-Usuario-Id: 00000000-0000-0000-0000-000000000001
Content-Type: application/json

{
  "estudianteIdentificacion": "123456789",
  "monto": 60000,
  "periodoID": "11111111-1111-1111-1111-111111111111"
}
```

**Respuesta exitosa (`201 Created`):** la factura creada (encabezado + detalles). El header `Location` apunta a `/api/factura/{FacturaID}`.

### PATCH /api/factura/{FacturaID} — Anular

```http
PATCH /api/factura/22222222-2222-2222-2222-222222222222
Authorization: Bearer <JWT>
X-Usuario-Id: 00000000-0000-0000-0000-000000000001
Content-Type: application/json

{
  "motivo": "Estudiante canceló la matrícula del período"
}
```

**Respuesta:** `200 OK` con la factura anulada (con `estado: "ANU"`, `fechaAnulacion` y `motivoAnulacion` registrados).

### GET /api/factura/{FacturaID} — Obtener por ID

```http
GET /api/factura/22222222-2222-2222-2222-222222222222
Authorization: Bearer <JWT>
X-Usuario-Id: 00000000-0000-0000-0000-000000000001
```

### GET /api/factura/periodo/{PeriodoID} — Obtener por período

```http
GET /api/factura/periodo/11111111-1111-1111-1111-111111111111
Authorization: Bearer <JWT>
X-Usuario-Id: 00000000-0000-0000-0000-000000000001
```

**Respuesta:** `200 OK` con arreglo de facturas (puede estar vacío).

## Formato de respuesta

```json
{
  "facturaID": "22222222-2222-2222-2222-222222222222",
  "identificacionEstudiante": "123456789",
  "matriculaID": "33333333-3333-3333-3333-333333333333",
  "periodoID": "11111111-1111-1111-1111-111111111111",
  "estado": "PEND",
  "fechaEmision": "2026-10-15T12:00:00",
  "fechaAnulacion": null,
  "motivoAnulacion": null,
  "subtotal": 60000,
  "porcentajeImpuesto": 2.00,
  "impuesto": 1200,
  "total": 61200,
  "detalles": [
    {
      "detalleFacturaID": 1,
      "descripcion": "Servicios estudiantiles",
      "cursoCode": "CURSO1",
      "monto": 30000
    }
  ]
}
```

## Reglas de negocio / Validaciones

- El período debe existir y estar activo.
- El estudiante debe tener matrícula activa en ese período.
- El `monto` debe ser un múltiplo de 30 000 y corresponder exactamente a la cantidad de cursos matriculados × 30 000.
- El impuesto se calcula como el 2 % del subtotal.
- No puede existir más de una factura activa para la misma matrícula.
- Para anular una factura, el `motivo` es obligatorio, no debe consistir únicamente de espacios en blanco y tiene una longitud máxima de 250 caracteres.
- Una factura ya anulada o en estado `Pagada` no puede anularse.
- Los identificadores (`FacturaID`, `PeriodoID`) son GUID.

## Integraciones

| Servicio | Uso |
|----------|-----|
| Login (USR5) | Validar token JWT |
| Bitácoras (GEN1) | Registrar operaciones (mejor esfuerzo) |
| Matrículas | Validar matrículas activas del estudiante |
| Períodos | Validar existencia y estado del período |
| Parámetros | (configuración adicional si aplica) |

## Configuración

Claves principales en `appsettings.json` / variables de entorno:

- `ConnectionStrings:DefaultConnection` → Cadena de conexión a `Facturacion_DB`.
- `MicroservicioLogin:BaseUrl` → URL base de MicroservicioLogin.
- `MicroservicioBitacoras:BaseUrl` → URL base de MicroservicioBitacoras.
- `MicroservicioMatriculas:BaseUrl` → URL base de MicroservicioMatriculas.
- `MicroservicioPeriodos:BaseUrl` → URL base de MicroservicioPeriodos.
- `MicroservicioParametros:BaseUrl` → URL base de MicroservicioParametros.

> **Nota de seguridad:** No versionar contraseñas ni credenciales. Usar variables de entorno o secretos de Plesk en producción.

## Base de datos

**Base de datos:** `Facturacion_DB`  
Tablas principales: `Facturas` (incluye `MotivoAnulacion VARCHAR(250) NULL`), `DetallesFacturas`.  
Usa procedimientos almacenados (`usp_Facturas_Crear`, `usp_Facturas_AgregarDetalle`, `usp_Facturas_Anular` con `@MotivoAnulacion`, `usp_Facturas_ObtenerPorID`, `usp_Facturas_ObtenerPorPeriodo`).

## Ejecución local

```bash
dotnet run --project Backend/MicroservicioFacturacion/MicroservicioFacturacion.csproj
```

## Respuestas y errores comunes

| Código | Cuándo ocurre |
|--------|---------------|
| 200 OK | Anulación o consulta exitosa |
| 201 Created | Factura creada |
| 400 Bad Request | Datos inválidos, monto incorrecto o error de negocio de procedimientos |
| 401 Unauthorized | Token o `X-Usuario-Id` ausente/inválido |
| 404 Not Found | Período, matrícula o factura no encontrados |
| 409 Conflict | Ya existe factura para la matrícula o factura ya anulada |
| 500 Internal Server Error | Error técnico no controlado |

## Diagrama de clases

![Diagrama de Clases Facturación](../../Documentacion/Diagramas%20Generales/Clases/Microservicios/DiagramaClases_Facturacion.png)

---

*Documentación estandarizada del microservicio MicroservicioFacturacion.*
