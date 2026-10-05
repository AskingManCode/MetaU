# MicroservicioDirecciones

Provee la información geográfica de Costa Rica en una jerarquía de provincias, cantones y distritos. La API es de solo lectura y devuelve únicamente ubicaciones activas.

**URL base local:** `http://localhost:5287` (perfil `http`) o `https://localhost:7047` (perfil `https`).  

**Prefijo de rutas:** `/api`  

**Diagrama de clases editable:** 

**Diagrama de clases:**  
![DiagramaClases_AdministracionDirecciones.drawio](../../Documentacion/Diagramas%20Generales/Clases/Microservicios/DiagramaClases_AdministracionDirecciones.drawio.png)

## Antes de consumir la API

Todas las operaciones requieren estos headers:

| Header | Valor | Descripción |
| --- | --- | --- |
| `Authorization` | `Bearer <JWT>` | Token emitido por MicroservicioLogin. |
| `UsuarioGUID` | `<UUID>` | GUID del usuario que realiza la consulta; se usa también en la bitácora. |

El servicio valida el JWT consultando MicroservicioLogin. Si falta el token o no es válido, responde `401 Unauthorized`. Si `UsuarioGUID` falta o no contiene un GUID válido, responde `400 Bad Request`.

Los identificadores de provincia y cantón en las rutas deben ser GUID válidos. Para consultar cantones y distritos, la provincia debe existir y estar activa. Para consultar distritos, también debe existir el cantón activo y pertenecer a esa provincia.

## Endpoints

| Método | Ruta | Uso |
| --- | --- | --- |
| `GET` | `/api/provincias` | Obtener las provincias activas. |
| `GET` | `/api/cantones/{ProvinciaID}` | Obtener los cantones activos de una provincia. |
| `GET` | `/api/distritos/{ProvinciaID}/{CantonID}` | Obtener los distritos activos de un cantón perteneciente a la provincia. |

No hay endpoints de creación, modificación ni eliminación en este microservicio.

### Listar provincias

```http
GET /api/provincias
Authorization: Bearer <JWT>
UsuarioGUID: 00000000-0000-0000-0000-000000000001
Accept: application/json
```

Responde `200 OK` con las provincias activas ordenadas por nombre. Si no existen provincias activas, devuelve un arreglo vacío.

### Listar cantones de una provincia

```http
GET /api/cantones/<ProvinciaID>
Authorization: Bearer <JWT>
UsuarioGUID: 00000000-0000-0000-0000-000000000001
Accept: application/json
```

Sustituye `<ProvinciaID>` por el `provinciaID` devuelto por `/api/provincias`. Responde `200 OK` con los cantones activos ordenados por nombre. Un GUID mal formado responde `400 Bad Request`; si la provincia no existe o está inactiva, responde `404 Not Found`.

### Listar distritos de un cantón

```http
GET /api/distritos/<ProvinciaID>/<CantonID>
Authorization: Bearer <JWT>
UsuarioGUID: 00000000-0000-0000-0000-000000000001
Accept: application/json
```

Usa el `provinciaID` y el `cantonID` obtenidos de las consultas anteriores. Ambos identificadores deben ser GUID válidos. Responde `200 OK` con los distritos activos ordenados por nombre; un identificador mal formado responde `400 Bad Request`, y una provincia o un cantón inexistente, inactivo o que no pertenezca a esa provincia responde `404 Not Found`.

## Formato de datos

Cada colección es un arreglo JSON. Por ejemplo, una provincia tiene esta forma:

```json
{
  "provinciaID": "00000000-0000-0000-0000-000000000001",
  "nombre": "Provincia de ejemplo",
  "estado": true
}
```

Los objetos de cantón incluyen `provinciaID`, `cantonID`, `nombre` y `estado`. Los de distrito incluyen `provinciaID`, `cantonID`, `distritoID`, `nombre` y `estado`. ASP.NET Core serializa por defecto los nombres de propiedades JSON en camelCase. Aunque las respuestas incluyen `estado`, las consultas filtran registros inactivos.

## Respuestas y errores comunes

| Estado | Cuándo ocurre |
| --- | --- |
| `200 OK` | Consulta completada; el contenido es un arreglo que puede estar vacío. |
| `400 Bad Request` | GUID con formato inválido o identificador requerido vacío. El error se devuelve como `{ "mensaje": "..." }`. |
| `401 Unauthorized` | Falta el header Bearer o el token no es válido. |
| `404 Not Found` | La provincia no existe o está inactiva, o el cantón no existe, está inactivo o no pertenece a la provincia especificada. |
| `500 Internal Server Error` | Error técnico al validar una dependencia o consultar la base de datos. |

El servicio registra las consultas en MicroservicioBitacoras. Si no se puede registrar una entrada de bitácora, la consulta principal continúa.

## Ejecutar y configurar

Requisitos: .NET 10, SQL Server con la base de datos `Ubicaciones_DB` y los procedimientos almacenados instalados. El esquema se define en [`Scripts SQL/Ubicaciones_DB/01. Ubicaciones_DB.sql`](../../Scripts%20SQL/Ubicaciones_DB/01.%20Ubicaciones_DB.sql); los procedimientos están en la carpeta [`Scripts SQL/Ubicaciones_DB/Procedimientos Almacenados`](../../Scripts%20SQL/Ubicaciones_DB/Procedimientos%20Almacenados).

Desde la raíz del repositorio:

```powershell
dotnet run --project .\Backend\MicroservicioDirecciones\MicroservicioDirecciones.csproj
```

Configura los siguientes valores mediante el mecanismo seguro de configuración del ambiente; para despliegues se pueden usar variables de entorno .NET. No guardes credenciales reales en el repositorio:

| Clave | Uso |
| --- | --- |
| `ConnectionStrings:DefaultConnection` | Cadena de conexión a SQL Server y a `Ubicaciones_DB`. |
| `MicroservicioLogin:BaseUrl` | URL base de MicroservicioLogin, con `/` al final; se invoca `validate`. |
| `MicroservicioBitacoras:BaseUrl` | URL base de MicroservicioBitacoras, con `/` al final; se invoca `bitacora`. |

Variables de entorno equivalentes: `ConnectionStrings__DefaultConnection`, `MicroservicioLogin__BaseUrl` y `MicroservicioBitacoras__BaseUrl`. Swagger y OpenAPI interactivo se habilitan solo en ambiente `Development`.

## Persistencia y componentes

Los datos se consultan en `Ubicaciones_DB.dbo.Provincias`, `dbo.Cantones` y `dbo.Distritos`. La persistencia usa Dapper y los procedimientos almacenados `usp_Provincias_ObtenerProvincias`, `usp_Cantones_ObtenerCantones` y `usp_Distritos_ObtenerDistritos`.

Flujo principal: endpoints HTTP -> validación de token y usuario -> `DireccionService` -> `DireccionRepository` -> SQL Server. La validación de JWT y el registro de auditoría se integran con MicroservicioLogin y MicroservicioBitacoras, respectivamente.
