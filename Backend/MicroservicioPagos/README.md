# Microservicio de Pagos - MAT1

Administra el registro y la reversión de pagos asociados a facturas de servicios estudiantiles.

## Historia de usuario

**MAT1** — Administración de Prematrícula / Pagos.

## Tecnologías

- .NET 10
- ASP.NET Core Minimal APIs
- Dapper sobre SQL Server
- Autenticación mediante Bearer Token (MicroservicioLogin)
- Registro de acciones en Bitácoras
- Integración con Períodos

## Endpoint base

`/api/pago`

**URL base en producción:**  
`https://tiusr20pl.cuc-carrera-ti.ac.cr/MicroservicioPagos_MetaU`

**URLs locales** (desde `Properties/launchSettings.json`):

- HTTP: `http://localhost:5010`
- HTTPS: `https://localhost:7233`

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
| POST | `/api/pago/{FacturaID}` | Registrar el pago de una factura | 201 Created |
| PATCH | `/api/pago/{PagoID}` | Reversar un pago existente | 200 OK |
| GET | `/api/pago/{PagoID}` | Obtener un pago por ID (incluye factura) | 200 OK |
| GET | `/api/pago/periodo/{PeriodoID}` | Obtener todos los pagos de un período | 200 OK |

### POST /api/pago/{FacturaID} — Registrar pago

```http
POST /api/pago/22222222-2222-2222-2222-222222222222
Authorization: Bearer <JWT>
X-Usuario-Id: 00000000-0000-0000-0000-000000000001
```

**Respuesta exitosa (`201 Created`):** el pago creado (incluye la factura completa con sus detalles). El header `Location` apunta a `/pago/{PagoID}`.

### PATCH /api/pago/{PagoID} — Reversar pago

```http
PATCH /api/pago/33333333-3333-3333-3333-333333333333
Authorization: Bearer <JWT>
X-Usuario-Id: 00000000-0000-0000-0000-000000000001
Content-Type: application/json

{
  "motivo": "Pago duplicado por error operativo"
}
```

**Respuesta:** `200 OK` con el pago reversado (con `estado: "REV"`, `fechaReversion` y `motivoReversion` registrados).

### GET /api/pago/{PagoID} — Obtener por ID

```http
GET /api/pago/33333333-3333-3333-3333-333333333333
Authorization: Bearer <JWT>
X-Usuario-Id: 00000000-0000-0000-0000-000000000001
```

### GET /api/pago/periodo/{PeriodoID} — Obtener por período

```http
GET /api/pago/periodo/11111111-1111-1111-1111-111111111111
Authorization: Bearer <JWT>
X-Usuario-Id: 00000000-0000-0000-0000-000000000001
```

**Respuesta:** `200 OK` con arreglo de pagos (puede estar vacío).

## Formato de respuesta

```json
{
  "pagoID": "33333333-3333-3333-3333-333333333333",
  "facturaID": "22222222-2222-2222-2222-222222222222",
  "monto": 61200,
  "fechaPago": "2026-10-15T12:00:00",
  "fechaReversion": null,
  "motivoReversion": null,
  "estado": "PAG",
  "factura": {
    "facturaID": "22222222-2222-2222-2222-222222222222",
    "identificacionEstudiante": "123456789",
    "matriculaID": "44444444-4444-4444-4444-444444444444",
    "periodoID": "11111111-1111-1111-1111-111111111111",
    "estado": "PAG",
    "fechaEmision": "2026-10-15T10:00:00",
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
}
```

## Reglas de negocio / Validaciones

- La factura debe existir y estar en un estado que permita el pago.
- No se puede pagar una factura ya pagada, anulada o sin saldo pendiente.
- No se puede reversar un pago que ya está reversado.
- Para reversar un pago es obligatorio proporcionar un motivo válido (máximo 250 caracteres, sin contener solo espacios en blanco).
- La reversión de un pago actualiza el estado de la factura asociada a `PEND` (Pendiente) para permitir su posterior cobro.
- Los identificadores (`FacturaID`, `PagoID`, `PeriodoID`) son GUID.
- Al consultar un pago se incluye la factura asociada con sus detalles.

## Integraciones

| Servicio | Uso |
|----------|-----|
| Login (USR5) | Validar token JWT |
| Bitácoras (GEN1) | Registrar operaciones (mejor esfuerzo) |
| Períodos | Validación / referencia de período |

## Configuración

Claves principales en `appsettings.json` / variables de entorno:

- `ConnectionStrings:DefaultConnection` → Cadena de conexión a `Facturacion_DB`.
- `MicroservicioLogin:BaseUrl` → URL base de MicroservicioLogin.
- `MicroservicioBitacoras:BaseUrl` → URL base de MicroservicioBitacoras.
- `MicroservicioPeriodos:BaseUrl` → URL base de MicroservicioPeriodos.

> **Nota de seguridad:** No versionar contraseñas ni credenciales. Usar variables de entorno o secretos de Plesk en producción.

## Base de datos

**Base de datos:** `Facturacion_DB` (compartida con Facturación).  
Usa procedimientos almacenados (`usp_Pagos_Crear`, `usp_Pagos_ObtenerPorID`, `usp_Pagos_ObtenerPorPeriodo`, `usp_Pagos_Reversar`, y consulta `usp_Facturas_ObtenerPorID`).

## Ejecución local

```bash
dotnet run --project Backend/MicroservicioPagos/MicroservicioPagos.csproj
```

## Respuestas y errores comunes

| Código | Cuándo ocurre |
|--------|---------------|
| 200 OK | Reversión o consulta exitosa |
| 201 Created | Pago registrado |
| 400 Bad Request | Identificador inválido o error de negocio de procedimientos |
| 401 Unauthorized | Token o `X-Usuario-Id` ausente/inválido |
| 404 Not Found | Factura o pago no encontrados |
| 409 Conflict | Factura ya pagada/anulada, sin saldo, o pago ya reversado |
| 500 Internal Server Error | Error técnico no controlado |

## Diagrama de clases

![Diagrama de Clases Pagos](../../Documentacion/Diagramas%20Generales/Clases/Microservicios/DiagramaClases_AdministracionPagos.png)

---

*Documentación estandarizada del microservicio MicroservicioPagos (MAT1).*
