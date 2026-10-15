# MicroservicioFacturacion

Administra la emisión y anulación de facturas de servicios estudiantiles asociadas a matrículas activas en un período académico.

**URL base del servicio:** pendiente de definir para cada ambiente; en ejecución local, `https://localhost:PORT`.

**Prefijo de rutas:** `/api/factura`

**Diagrama de clases:**

![Diagrama de Clases](../../Documentacion/Diagramas%20Generales/Clases/Microservicios/DiagramaClases_Facturacion.png)

## Antes de consumir la API

Todas las operaciones requieren estos headers:

| Header | Valor | Descripción |
| --- | --- | --- |
| `Authorization` | `Bearer <JWT>` | Token emitido por MicroservicioLogin. |
| `X-Usuario-Id` | `<UUID>` | GUID del usuario que realiza la operación; también se utiliza para la bitácora. |

El servicio valida el token consultando MicroservicioLogin. Sin token, con token inválido o con `X-Usuario-Id` ausente o no válido responde `401 Unauthorized`.

Los cuerpos y respuestas usan JSON. El monto debe ser un múltiplo de 30 000 colones y corresponder exactamente al número de cursos matriculados en el período indicado (30 000 por curso).

## Endpoints

| Método | Ruta | Uso |
| --- | --- | --- |
| `POST` | `/api/factura/` | Crear una factura para un estudiante en un período. |
| `PATCH` | `/api/factura/{FacturaID}` | Anular una factura existente. |
| `GET` | `/api/factura/{FacturaID}` | Obtener una factura por su identificador, con sus detalles. |
| `GET` | `/api/factura/periodo/{PeriodoID}` | Obtener todas las facturas de un período. |

`FacturaID` y `PeriodoID` son GUID.

### Crear

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

Responde `201 Created` con la factura creada (encabezado + detalles) y el header `Location` apunta a `/api/factura/{FacturaID}`.

El servicio valida que:
- El período exista y esté activo.
- El estudiante tenga matrícula activa en ese período.
- El monto coincida con `cantidad de cursos × 30 000`.

Si ya existe una factura para la misma matrícula responde `409 Conflict`.

### Anular

```http
PATCH /api/factura/22222222-2222-2222-2222-222222222222
Authorization: Bearer <JWT>
X-Usuario-Id: 00000000-0000-0000-0000-000000000001
```

Responde `200 OK` con la factura anulada. Si la factura no existe responde `404 Not Found`. Si ya estaba anulada responde `409 Conflict`.

### Consultar por ID

```http
GET /api/factura/22222222-2222-2222-2222-222222222222
Authorization: Bearer <JWT>
X-Usuario-Id: 00000000-0000-0000-0000-000000000001
```

Responde `200 OK` con la factura y sus detalles, o `404 Not Found` si no existe.

### Consultar por período

```http
GET /api/factura/periodo/11111111-1111-1111-1111-111111111111
Authorization: Bearer <JWT>
X-Usuario-Id: 00000000-0000-0000-0000-000000000001
```

Responde `200 OK` con un arreglo de facturas (cada una con sus detalles). Si no hay registros, el arreglo está vacío.

## Formato de datos

### Request de creación

```json
{
  "estudianteIdentificacion": "123456789",
  "monto": 60000,
  "periodoID": "11111111-1111-1111-1111-111111111111"
}
```

### Response de factura

```json
{
  "facturaID": "22222222-2222-2222-2222-222222222222",
  "identificacionEstudiante": "123456789",
  "matriculaID": "33333333-3333-3333-3333-333333333333",
  "periodoID": "11111111-1111-1111-1111-111111111111",
  "estado": "PEND",
  "fechaEmision": "2026-10-15T12:00:00",
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
```

ASP.NET Core serializa los nombres JSON en camelCase por defecto.

## Respuestas y errores comunes

| Estado | Cuándo ocurre |
| --- | --- |
| `200 OK` | Anulación o consulta completada. |
| `201 Created` | Factura creada. |
| `400 Bad Request` | Datos inválidos, monto incorrecto o error de negocio reportado por los procedimientos almacenados. |
| `401 Unauthorized` | Falta el header Bearer, el token no es válido o falta `X-Usuario-Id`. |
| `404 Not Found` | Período, matrícula o factura no encontrados. |
| `409 Conflict` | Ya existe factura para la matrícula o la factura ya está anulada. |
| `500 Internal Server Error` | Error técnico no recuperable. En desarrollo se incluye `detalle` y `tipo`. |

Las operaciones registran acciones en MicroservicioBitacoras. Si la bitácora no está disponible, la operación principal continúa.

## Ejecutar y configurar

Requisitos: .NET 10, SQL Server con la base de datos `Facturacion_DB` creada y los procedimientos almacenados de facturación instalados.

Desde la raíz del repositorio:

```powershell
dotnet run --project .\Backend\MicroservicioFacturacion\MicroservicioFacturacion.csproj
```

La aplicación requiere estos valores de configuración. En despliegues se pueden definir mediante variables de entorno .NET (separador `__`); no se deben guardar credenciales reales en el repositorio:

| Clave | Ejemplo/uso |
| --- | --- |
| `ConnectionStrings:DefaultConnection` | Cadena de conexión a SQL Server y a `Facturacion_DB`. |
| `MicroservicioLogin:BaseUrl` | URL base de MicroservicioLogin, con `/` al final. |
| `MicroservicioBitacoras:BaseUrl` | URL base de MicroservicioBitacoras, con `/` al final. |
| `MicroservicioMatriculas:BaseUrl` | URL base de MicroservicioMatriculas, con `/` al final. |
| `MicroservicioPeriodos:BaseUrl` | URL base de MicroservicioPeriodos, con `/` al final. |

Equivalentes como variables de entorno: `ConnectionStrings__DefaultConnection`, `MicroservicioLogin__BaseUrl`, `MicroservicioBitacoras__BaseUrl`, `MicroservicioMatriculas__BaseUrl` y `MicroservicioPeriodos__BaseUrl`. Swagger y OpenAPI interactivo se habilitan solo cuando el ambiente es `Development`.

## Persistencia y componentes

Los datos se guardan en `Facturacion_DB.dbo.Facturas` (encabezado) y `Facturacion_DB.dbo.DetallesFacturas` (líneas por curso). La persistencia usa Dapper y estos procedimientos almacenados: `usp_Facturas_Crear`, `usp_Facturas_AgregarDetalle`, `usp_Facturas_Anular`, `usp_Facturas_ObtenerPorID` y `usp_Facturas_ObtenerPorPeriodo`.

Flujo principal: endpoints HTTP → validación de autenticación y de la solicitud → `FacturacionService` → `FacturacionRepository` → SQL Server. El servicio consulta MicroservicioPeriodos y MicroservicioMatriculas para validar el período y las matrículas activas del estudiante. La validación de JWT y el registro de auditoría se integran respectivamente con MicroservicioLogin y MicroservicioBitacoras.

El impuesto se calcula como el 2 % del subtotal. El monto por curso es fijo (30 000 colones).
