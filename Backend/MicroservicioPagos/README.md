# MicroservicioPagos

Administra el registro y la reversión de pagos asociados a facturas de servicios estudiantiles.

**URL base del servicio:** pendiente de definir para cada ambiente; en ejecución local, `https://localhost:PORT`.

**Prefijo de rutas:** `/pago`

**Diagrama de clases:**

![Diagrama de Clases](../../Documentacion/Diagramas%20Generales/Clases/Microservicios/DiagramaClases_Pagos.png)

## Antes de consumir la API

Todas las operaciones requieren estos headers:

| Header | Valor | Descripción |
| --- | --- | --- |
| `Authorization` | `Bearer <JWT>` | Token emitido por MicroservicioLogin. |
| `X-Usuario-Id` | `<UUID>` | GUID del usuario que realiza la operación; también se utiliza para la bitácora. |

El servicio valida el token consultando MicroservicioLogin. Sin token, con token inválido o con `X-Usuario-Id` ausente o no válido responde `401 Unauthorized`.

Los cuerpos y respuestas usan JSON.

## Endpoints

| Método | Ruta | Uso |
| --- | --- | --- |
| `POST` | `/pago/{FacturaID}` | Registrar el pago de una factura. |
| `PATCH` | `/pago/{PagoID}` | Reversar un pago existente. |
| `GET` | `/pago/{PagoID}` | Obtener un pago por su identificador (incluye la factura asociada). |
| `GET` | `/pago/periodo/{PeriodoID}` | Obtener todos los pagos de un período. |

`FacturaID`, `PagoID` y `PeriodoID` son GUID.

### Registrar pago

```http
POST /pago/22222222-2222-2222-2222-222222222222
Authorization: Bearer <JWT>
X-Usuario-Id: 00000000-0000-0000-0000-000000000001
```

Responde `201 Created` con el pago creado (incluye la factura completa con sus detalles) y el header `Location` apunta a `/pago/{PagoID}`.

El servicio valida que la factura exista y esté en un estado que permita el pago.  
Si la factura no existe responde `404 Not Found`.  
Si la factura ya está pagada, anulada o no tiene saldo pendiente responde `409 Conflict`.

### Reversar pago

```http
PATCH /pago/33333333-3333-3333-3333-333333333333
Authorization: Bearer <JWT>
X-Usuario-Id: 00000000-0000-0000-0000-000000000001
```

Responde `200 OK` con el pago reversado.  
Si el pago no existe responde `404 Not Found`.  
Si el pago ya estaba reversado responde `409 Conflict`.

### Consultar por ID

```http
GET /pago/33333333-3333-3333-3333-333333333333
Authorization: Bearer <JWT>
X-Usuario-Id: 00000000-0000-0000-0000-000000000001
```

Responde `200 OK` con el pago y la factura asociada (incluyendo detalles), o `404 Not Found` si no existe.

### Consultar por período

```http
GET /pago/periodo/11111111-1111-1111-1111-111111111111
Authorization: Bearer <JWT>
X-Usuario-Id: 00000000-0000-0000-0000-000000000001
```

Responde `200 OK` con un arreglo de pagos (cada uno con su factura y detalles). Si no hay registros, el arreglo está vacío.

## Formato de datos

### Response de pago

```json
{
  "pagoID": "33333333-3333-3333-3333-333333333333",
  "facturaID": "22222222-2222-2222-2222-222222222222",
  "monto": 61200,
  "fechaPago": "2026-10-15T12:00:00",
  "fechaReversion": null,
  "estado": "PAG",
  "factura": {
    "facturaID": "22222222-2222-2222-2222-222222222222",
    "identificacionEstudiante": "123456789",
    "matriculaID": "44444444-4444-4444-4444-444444444444",
    "periodoID": "11111111-1111-1111-1111-111111111111",
    "estado": "PAG",
    "fechaEmision": "2026-10-15T10:00:00",
    "fechaAnulacion": null,
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
      },
      {
        "detalleFacturaID": 2,
        "descripcion": "Servicios estudiantiles",
        "cursoCode": "CURSO2",
        "monto": 30000
      }
    ]
  }
}
```

ASP.NET Core serializa los nombres JSON en camelCase por defecto.

## Respuestas y errores comunes

| Estado | Cuándo ocurre |
| --- | --- |
| `200 OK` | Reversión o consulta completada. |
| `201 Created` | Pago registrado. |
| `400 Bad Request` | Identificador inválido o error de negocio reportado por los procedimientos almacenados. |
| `401 Unauthorized` | Falta el header Bearer, el token no es válido o falta `X-Usuario-Id`. |
| `404 Not Found` | Factura o pago no encontrados. |
| `409 Conflict` | La factura ya está pagada/anulada, no tiene saldo, o el pago ya está reversado. |
| `500 Internal Server Error` | Error técnico no recuperable. En desarrollo se incluye `detalle` y `tipo`. |

Las operaciones registran acciones en MicroservicioBitacoras. Si la bitácora no está disponible, la operación principal continúa.

## Ejecutar y configurar

Requisitos: .NET 10, SQL Server con la base de datos correspondiente creada y los procedimientos almacenados de pagos (y los de facturas que se consultan) instalados.

Desde la raíz del repositorio:

```powershell
dotnet run --project .\Backend\MicroservicioPagos\MicroservicioPagos.csproj
```

La aplicación requiere estos valores de configuración. En despliegues se pueden definir mediante variables de entorno .NET (separador `__`); no se deben guardar credenciales reales en el repositorio:

| Clave | Ejemplo/uso |
| --- | --- |
| `ConnectionStrings:DefaultConnection` | Cadena de conexión a SQL Server. |
| `MicroservicioLogin:BaseUrl` | URL base de MicroservicioLogin, con `/` al final. |
| `MicroservicioBitacoras:BaseUrl` | URL base de MicroservicioBitacoras, con `/` al final. |
| `MicroservicioPeriodos:BaseUrl` | URL base de MicroservicioPeriodos, con `/` al final. |

Equivalentes como variables de entorno: `ConnectionStrings__DefaultConnection`, `MicroservicioLogin__BaseUrl`, `MicroservicioBitacoras__BaseUrl` y `MicroservicioPeriodos__BaseUrl`. Swagger y OpenAPI interactivo se habilitan solo cuando el ambiente es `Development`.

## Persistencia y componentes

Los datos se persisten mediante Dapper y los procedimientos almacenados `usp_Pagos_Crear`, `usp_Pagos_ObtenerPorID`, `usp_Pagos_ObtenerPorPeriodo` y `usp_Pagos_Reversar`.  
Al recuperar un pago también se consulta la factura asociada mediante `usp_Facturas_ObtenerPorID`.

Flujo principal: endpoints HTTP → validación de autenticación → `PagosService` → `PagosRepository` → SQL Server.  
La validación de JWT y el registro de auditoría se integran respectivamente con MicroservicioLogin y MicroservicioBitacoras.
