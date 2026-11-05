# Microservicio de Parámetros

Microservicio encargado de la administración de los parámetros globales de configuración de MetaU.

## Historia de usuario

Administración de parámetros globales.

Permite crear, modificar, eliminar (lógica o físicamente) y consultar los parámetros de configuración utilizados por los demás microservicios.

## Tecnologías

- .NET 10
- ASP.NET Core Minimal APIs
- Dapper (SQL directo) sobre SQL Server
- Validación de solicitudes con FluentValidation
- Autenticación mediante JWT (MicroservicioLogin)
- Registro de acciones en Bitácoras

## Endpoint base

`/api/parametro`

**URL base en producción:**  
`https://tiusr20pl.cuc-carrera-ti.ac.cr/MicroservicioParametros_MetaU`

**URLs locales** (desde `Properties/launchSettings.json`):

- HTTP: `http://localhost:5227`
- HTTPS: `https://localhost:7051`

## Autenticación

Todas las operaciones requieren los siguientes headers:

| Header | Valor | Descripción |
|--------|-------|-------------|
| `Authorization` | `Bearer <JWT>` | Token emitido por MicroservicioLogin |
| `UsuarioGUID` | `<GUID>` | Identificador del usuario que realiza la operación |

El token se valida contra `POST /validate` de Login.  
Sin token o token inválido → `401 Unauthorized`.  
Si falta `UsuarioGUID` o no es un GUID válido → `401 Unauthorized`.

Los cuerpos y respuestas usan JSON. El código debe contener entre 1 y 10 letras mayúsculas (`A-Z`); el valor es obligatorio y admite hasta 500 caracteres.

## Endpoints

| Método | Ruta | Descripción | Respuesta exitosa |
|--------|------|-------------|-------------------|
| POST | `/api/parametro/` | Crear un parámetro | 201 Created |
| PATCH | `/api/parametro/{ParametroCode}` | Actualizar el valor de un parámetro | 200 OK |
| DELETE | `/api/parametro/{ParametroCode}?eliminacionFisica={valor}` | Desactivar o eliminar un parámetro | 200 OK |
| GET | `/api/parametro/` | Obtener todos los parámetros, activos e inactivos | 200 OK |
| GET | `/api/parametro/?pagina={n}` | Obtener parámetros paginados | 200 OK |
| GET | `/api/parametro/{ParametroCode}` | Obtener un parámetro por código | 200 OK |

`ParametroCode` distingue mayúsculas y minúsculas en las rutas: `IVA` es válido y `ivA` no. En el `PATCH`, el código de la ruta es el que se procesa; el cuerpo solo necesita incluir `Valor`.

### POST /api/parametro/ — Crear

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

Responde `201 Created` con el parámetro creado y un header `Location` que apunta a `/api/parametro/IVA`. Si ya existe un parámetro con ese código, responde `409 Conflict`.

### PATCH /api/parametro/{ParametroCode} — Modificar

Este endpoint actualiza únicamente el valor. El código se toma de la ruta.

```http
PATCH /api/parametro/IVA
Authorization: Bearer <JWT>
UsuarioGUID: 00000000-0000-0000-0000-000000000001
Content-Type: application/json

{
  "valor": "15"
}
```

Responde `200 OK` con el parámetro actualizado o `404 Not Found` si no existe.

### DELETE /api/parametro/{ParametroCode} — Eliminar

El parámetro de consulta `eliminacionFisica` permite seleccionar el tipo de eliminación:

```http
DELETE /api/parametro/IVA?eliminacionFisica=false
Authorization: Bearer <JWT>
UsuarioGUID: 00000000-0000-0000-0000-000000000001
```

- `eliminacionFisica=false`: eliminación lógica; conserva el registro y establece `Estado` en `false`.
- `eliminacionFisica=true`: elimina el registro de la base de datos de forma permanente e irreversible.

Responde `200 OK` con el registro resultante o `404 Not Found` si el código no existe.

### GET /api/parametro/ y GET /api/parametro/{ParametroCode}

```http
GET /api/parametro/
GET /api/parametro/IVA
Authorization: Bearer <JWT>
UsuarioGUID: 00000000-0000-0000-0000-000000000001
```

La consulta individual devuelve `200 OK` o `404 Not Found`. La consulta de la colección devuelve `200 OK` con un arreglo e incluye también los parámetros inactivos; si no hay registros, el arreglo está vacío.

### Paginación

Agregar `?pagina=1` (valor ≥ 1). El tamaño de página se obtiene del parámetro `PAGSIZE` (por defecto **15**). Si el parámetro no está disponible, está inactivo o no contiene un entero positivo, se utiliza el valor por defecto.

```http
GET /api/parametro/?pagina=1
Authorization: Bearer <JWT>
UsuarioGUID: 00000000-0000-0000-0000-000000000001
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
      "parametroCode": "IVA",
      "valor": "13",
      "estado": true
    }
  ]
}
```

## Formato de datos

```json
{
  "parametroCode": "IVA",
  "valor": "13",
  "estado": true
}
```

## Reglas de negocio / Validaciones

- `ParametroCode` es obligatorio, único y solo puede contener entre 1 y 10 letras mayúsculas (`A-Z`).
- `Valor` es obligatorio y admite hasta 500 caracteres.
- En una modificación, el valor de `ParametroCode` en la ruta determina el registro; solo se actualiza `Valor`.
- La eliminación lógica (`eliminacionFisica=false`) conserva el registro y cambia `Estado` a `false`; con `eliminacionFisica=true` se elimina permanentemente.
- Las consultas de colección incluyen parámetros activos e inactivos.
- Para paginar, `pagina` debe ser mayor o igual a 1.

## Integraciones

| Servicio | Uso |
|----------|-----|
| Login (USR5) | Validar token JWT |
| Bitácoras (GEN1) | Registrar operaciones (mejor esfuerzo) |

## Configuración

Claves principales en `appsettings.json` / variables de entorno:

- `ConnectionStrings:DefaultConnection` → Cadena de conexión a `tiusr20pl_Configuraciones_DB`.
- `MicroservicioLogin:BaseUrl` → URL base de MicroservicioLogin; el servicio invoca `validate`.
- `MicroservicioBitacoras:BaseUrl` → URL base de MicroservicioBitacoras; el servicio invoca `bitacora`.
- `Cors:AllowedOrigins` → Orígenes permitidos para solicitudes CORS.

> **Nota de seguridad:** No versionar contraseñas ni credenciales. Usar variables de entorno o secretos de Plesk en producción.

## Base de datos

**Base de datos:** `Configuraciones_DB`  
Tabla principal: Parametros.  
Usa procedimientos almacenados (`usp_Parametros_Crear`, `usp_Parametros_ObtenerPorID`, `usp_Parametros_ObtenerTodos`, `usp_Parametros_Modificar` y `usp_Parametros_Eliminar`).

## Ejecución local

Requiere .NET 10 y SQL Server con la base de datos y los procedimientos almacenados configurados.

```bash
dotnet run --project Backend/MicroservicioParametros/MicroservicioParametros.csproj
```

## Respuestas y errores comunes

| Código | Cuándo ocurre |
|--------|---------------|
| 200 OK | Consulta, modificación o eliminación exitosa |
| 201 Created | Parámetro creado |
| 400 Bad Request | Datos inválidos, código en minúsculas, `UsuarioGUID` inválido o página < 1 |
| 401 Unauthorized | Token o `UsuarioGUID` ausente/inválido |
| 404 Not Found | Parámetro no encontrado |
| 409 Conflict | Ya existe un parámetro con el mismo código |
| 500 Internal Server Error | Error técnico no controlado |

## Diagrama de clases

![Diagrama de Clases de Parámetros](../../Documentacion/Diagramas%20Generales/Clases/Microservicios/DiagramaClases_AdministracionParametrizacion.drawio.png)

---

*Documentación estandarizada del microservicio MicroservicioParametros.*
