# Microservicio de Direcciones

Provee la información geográfica de Costa Rica en una jerarquía de provincias, cantones y distritos. La API es de solo lectura y devuelve únicamente ubicaciones activas.

## Historia de usuario

Catálogo geográfico de Costa Rica (provincias, cantones y distritos) para uso en expedientes y direcciones de estudiantes.

## Tecnologías

- .NET 10
- ASP.NET Core Minimal APIs
- Dapper sobre SQL Server
- Autenticación mediante Bearer Token (MicroservicioLogin)
- Registro de consultas en Bitácoras

## Endpoint base

`/api`

**URL base en producción:**  
`https://tiusr20pl.cuc-carrera-ti.ac.cr/MicroservicioDirecciones_MetaU/api`

**URLs locales** (desde `Properties/launchSettings.json`):

- HTTP: `http://localhost:5287`
- HTTPS: `https://localhost:7047`

## Autenticación

Todas las operaciones requieren los siguientes headers:

| Header | Valor | Descripción |
|--------|-------|-------------|
| `Authorization` | `Bearer <JWT>` | Token emitido por MicroservicioLogin |
| `UsuarioGUID` | `<GUID>` | Identificador del usuario que realiza la consulta (se usa también para bitácora) |

El token se valida contra `POST /validate` de Login.  
Sin token o token inválido → `401 Unauthorized`.  
Si falta `UsuarioGUID` o no es un GUID válido → `400 Bad Request`.

> **Nota:** Este microservicio usa el header `UsuarioGUID` (en lugar de `X-Usuario-Id` como el resto de servicios).

## Endpoints

| Método | Ruta | Descripción | Respuesta exitosa |
|--------|------|-------------|-------------------|
| GET | `/api/provincias` | Obtener las provincias activas | 200 OK |
| GET | `/api/cantones/{ProvinciaID}` | Obtener los cantones activos de una provincia | 200 OK |
| GET | `/api/distritos/{ProvinciaID}/{CantonID}` | Obtener los distritos activos de un cantón | 200 OK |

No existen endpoints de creación, modificación ni eliminación. Es un servicio de solo lectura.

### GET /api/provincias — Listar provincias

```http
GET /api/provincias
Authorization: Bearer <JWT>
UsuarioGUID: 00000000-0000-0000-0000-000000000001
```

**Respuesta:** `200 OK` con arreglo de provincias activas ordenadas por nombre (puede ser vacío).

### GET /api/cantones/{ProvinciaID} — Listar cantones

```http
GET /api/cantones/00000000-0000-0000-0000-000000000001
Authorization: Bearer <JWT>
UsuarioGUID: 00000000-0000-0000-0000-000000000001
```

`ProvinciaID` debe ser un GUID válido. Si la provincia no existe o está inactiva → `404 Not Found`.

### GET /api/distritos/{ProvinciaID}/{CantonID} — Listar distritos

```http
GET /api/distritos/00000000-0000-0000-0000-000000000001/00000000-0000-0000-0000-000000000002
Authorization: Bearer <JWT>
UsuarioGUID: 00000000-0000-0000-0000-000000000001
```

Ambos identificadores deben ser GUID válidos. El cantón debe pertenecer a la provincia indicada y ambos deben estar activos.

## Formato de datos

**Provincia:**

```json
{
  "provinciaID": "00000000-0000-0000-0000-000000000001",
  "nombre": "San Jose",
  "estado": true
}
```

**Cantón:**

```json
{
  "provinciaID": "00000000-0000-0000-0000-000000000001",
  "cantonID": "00000000-0000-0000-0000-000000000002",
  "nombre": "San Jose",
  "estado": true
}
```

**Distrito:**

```json
{
  "provinciaID": "00000000-0000-0000-0000-000000000001",
  "cantonID": "00000000-0000-0000-0000-000000000002",
  "distritoID": "00000000-0000-0000-0000-000000000003",
  "nombre": "Carmen",
  "estado": true
}
```

Las respuestas se serializan en camelCase. Aunque incluyen `estado`, las consultas filtran solo registros activos.

## Reglas de negocio / Validaciones

- Solo se devuelven ubicaciones activas (`estado = true`).
- Los identificadores de provincia y cantón deben ser GUID válidos.
- Para cantones: la provincia debe existir y estar activa.
- Para distritos: la provincia y el cantón deben existir, estar activos y el cantón debe pertenecer a la provincia.
- Ordenamiento por nombre en todas las consultas.

## Integraciones

| Servicio | Uso |
|----------|-----|
| Login (USR5) | Validar token JWT |
| Bitácoras (GEN1) | Registrar consultas (mejor esfuerzo) |

## Configuración

Claves principales en `appsettings.json` / variables de entorno:

- `ConnectionStrings:DefaultConnection` → Cadena de conexión a `Ubicaciones_DB`.
- `MicroservicioLogin:BaseUrl` → URL base de MicroservicioLogin.
- `MicroservicioBitacoras:BaseUrl` → URL base de MicroservicioBitacoras.

> **Nota de seguridad:** No versionar contraseñas ni credenciales. Usar variables de entorno o secretos de Plesk en producción.

## Base de datos

**Base de datos:** `Ubicaciones_DB`  
Tablas: `Provincias`, `Cantones`, `Distritos`.  
Usa procedimientos almacenados (`usp_Provincias_ObtenerProvincias`, `usp_Cantones_ObtenerCantones`, `usp_Distritos_ObtenerDistritos`).

## Ejecución local

```bash
dotnet run --project Backend/MicroservicioDirecciones/MicroservicioDirecciones.csproj
```

## Respuestas y errores comunes

| Código | Cuándo ocurre |
|--------|---------------|
| 200 OK | Consulta exitosa (el arreglo puede estar vacío) |
| 400 Bad Request | GUID con formato inválido o `UsuarioGUID` ausente/inválido |
| 401 Unauthorized | Token ausente o inválido |
| 404 Not Found | Provincia o cantón no encontrado, inactivo o que no pertenece a la jerarquía |
| 500 Internal Server Error | Error técnico no controlado |

## Diagrama de clases

![Diagrama de Clases Direcciones](../../Documentacion/Diagramas%20Generales/Clases/Microservicios/DiagramaClases_AdministracionDirecciones.drawio.png)

---

*Documentación estandarizada del microservicio MicroservicioDirecciones.*
