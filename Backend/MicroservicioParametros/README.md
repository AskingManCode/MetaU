# MicroservicioParametros

Administra los parámetros globales de configuración de MetaU. Cada parámetro tiene un código único, un valor y un estado de activación.

**URL base del servicio:** pendiente de definir para cada ambiente; en ejecución local, `https://localhost:PORT`.

**Prefijo de rutas:** `/api/parametro`

**Diagrama de clases:** 

![Diagrama de Clases](../../Documentacion/Diagramas%20Generales/Clases/Microservicios/DiagramaClases_AdministracionParametrizacion.drawio.png)

## Antes de consumir la API

Todas las operaciones requieren estos headers:

| Header | Valor | Descripción |
| --- | --- | --- |
| `Authorization` | `Bearer <JWT>` | Token emitido por MicroservicioLogin. |
| `UsuarioGUID` | `<UUID>` | GUID del usuario que realiza la operación; también se utiliza para la bitácora. |

El servicio valida el token consultando MicroservicioLogin. Sin token o con token inválido responde `401 Unauthorized`. Si falta `UsuarioGUID` o no es un GUID válido responde `400 Bad Request`.

Los cuerpos y respuestas usan JSON. El código del parámetro debe tener entre 1 y 10 letras mayúsculas (`A-Z`); el valor es obligatorio y admite hasta 500 caracteres.

## Endpoints

| Método | Ruta | Uso |
| --- | --- | --- |
| `GET` | `/api/parametro/` | Obtener todos los parámetros, incluidos los desactivados. |
| `GET` | `/api/parametro/{ParametroCode}` | Obtener un parámetro por su código, incluye desactivados. |
| `POST` | `/api/parametro/` | Crear un parámetro. |
| `PATCH` | `/api/parametro/{ParametroCode}` | Actualizar el valor de un parámetro existente. |
| `DELETE` | `/api/parametro/{ParametroCode}?eliminacionFisica=false` | Desactivar el parámetro o eliminarlo físicamente. |

`ParametroCode` acepta únicamente letras mayúsculas: `IVA` es válido y `ivA` no. En el `PATCH`, el código de la ruta es el que se procesa; el cuerpo solo necesita contener `Valor`.

### Crear

```http
POST /api/parametro/
Authorization: Bearer <JWT>
UsuarioGUID: 00000000-0000-0000-0000-000000000001
Content-Type: application/json

{
  "parametroCode": "IVA",
  "valor": "13"
}
```

Responde `201 Created` con el parámetro creado y el header `Location` apunta a `/api/parametro/IVA`. Si el código ya existe, responde `409 Conflict`.

### Consultar

```http
GET /api/parametro/IVA
Authorization: Bearer <JWT>
UsuarioGUID: 00000000-0000-0000-0000-000000000001
```

La consulta individual devuelve `200 OK` o `404 Not Found`. La consulta de la colección devuelve `200 OK` con un arreglo; si no hay registros, el arreglo está vacío.

### Actualizar

```http
PATCH /api/parametro/IVA
Authorization: Bearer <JWT>
UsuarioGUID: 00000000-0000-0000-0000-000000000001
Content-Type: application/json

{
  "valor": "15"
}
```

Responde `200 OK` con el parámetro actualizado o `404 Not Found` si no existe. Este endpoint actualiza únicamente `Valor`.

### Eliminar o desactivar

```http
DELETE /api/parametro/IVA?eliminacionFisica=false
Authorization: Bearer <JWT>
UsuarioGUID: 00000000-0000-0000-0000-000000000001
```

- `eliminacionFisica=false` (predeterminado): eliminación lógica; conserva el registro y establece `Estado` en `false`.
- `eliminacionFisica=true`: elimina el registro de la base de datos de forma permanente.

Responde `200 OK` con el registro resultante o `404 Not Found` si el código no existe. La opción física es irreversible.

## Formato de datos

Los endpoints de lectura, creación, modificación y eliminación devuelven objetos con esta forma:

```json
{
  "parametroCode": "IVA",
  "valor": "13",
  "estado": true
}
```

La colección devuelve un arreglo de estos objetos. ASP.NET Core serializa los nombres JSON en camelCase por defecto.

## Respuestas y errores comunes

| Estado | Cuándo ocurre |
| --- | --- |
| `200 OK` | Consulta, modificación o eliminación completada. |
| `201 Created` | Parámetro creado. |
| `400 Bad Request` | Código o valor inválido, o `UsuarioGUID` ausente/no válido. La validación del cuerpo incluye `errores`, con `campo` y `mensaje`. |
| `401 Unauthorized` | Falta el header Bearer o el token no es válido. |
| `404 Not Found` | El código solicitado no existe. |
| `409 Conflict` | Ya existe un parámetro con el código indicado al crear. |
| `500 Internal Server Error` | Error técnico no recuperable al procesar la solicitud. |

Las operaciones registran acciones en MicroservicioBitacoras. Si la bitácora no está disponible, la operación principal continúa.

## Ejecutar y configurar

Requisitos: .NET 10, SQL Server con la base de datos `Configuraciones_DB` creada y los procedimientos almacenados de parámetros instalados. La definición está en [`Scripts SQL/Configuraciones_DB`](../../Scripts%20SQL/Configuraciones_DB/01.%20Configuraciones_DB.sql); los procedimientos están en su carpeta [`Scripts SQL/Configuraciones_DB/Procedimientos Almacenados`](../../Scripts%20SQL/Configuraciones_DB/Procedimientos%20Almacenados).

Desde la raíz del repositorio:

```powershell
dotnet run --project .\Backend\MicroservicioParametros\MicroservicioParametros.csproj
```

La aplicación requiere estos valores de configuración. En despliegues se pueden definir mediante variables de entorno .NET (separador `__`); no se deben guardar credenciales reales en el repositorio:

| Clave | Ejemplo/uso |
| --- | --- |
| `ConnectionStrings:DefaultConnection` | Cadena de conexión a SQL Server y a `Configuraciones_DB`. |
| `MicroservicioLogin:BaseUrl` | URL base de MicroservicioLogin, con `/` al final; el servicio invoca `validate`. |
| `MicroservicioBitacoras:BaseUrl` | URL base de MicroservicioBitacoras, con `/` al final; el servicio invoca `bitacora`. |

Equivalentes como variables de entorno: `ConnectionStrings__DefaultConnection`, `MicroservicioLogin__BaseUrl` y `MicroservicioBitacoras__BaseUrl`. Swagger y OpenAPI interactivo se habilitan solo cuando el ambiente es `Development`.

## Persistencia y componentes

Los datos se guardan en `Configuraciones_DB.dbo.Parametros`, con `ParametroCode` como clave primaria, `Valor` como texto de configuración y `Estado` como indicador de activación. La persistencia usa Dapper y estos procedimientos almacenados: `usp_Parametros_Crear`, `usp_Parametros_ObtenerPorID`, `usp_Parametros_ObtenerTodos`, `usp_Parametros_Modificar` y `usp_Parametros_Eliminar`.

Flujo principal: endpoints HTTP -> validación de autenticación y de la solicitud -> `ParametroService` -> `ParametroRepository` -> SQL Server. La validación de JWT y el registro de auditoría se integran respectivamente con MicroservicioLogin y MicroservicioBitacoras.
