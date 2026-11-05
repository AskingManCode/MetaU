# Microservicio de Bitácoras - GEN1

Microservicio encargado del registro centralizado y la consulta de bitácoras (auditoría) del sistema MetaU.

## Historia de usuario

**GEN1** — Registro y consulta de bitácoras.

El servicio permite registrar las acciones realizadas por los usuarios y consultar las bitácoras almacenadas (con o sin paginación).

## Tecnologías

- .NET 10
- ASP.NET Core Minimal APIs
- SQL Server (`Microsoft.Data.SqlClient`)
- Autenticación mediante Bearer Token (integración con MicroservicioLogin)
- Consulta de parámetros (MicroservicioParametros) para el tamaño de página

## Endpoint base

`/bitacora`

**URL base en producción:**  
`https://tiusr20pl.cuc-carrera-ti.ac.cr/MicroservicioBitacoras_MetaU`

**URLs locales** (desde `Properties/launchSettings.json`):

- HTTP: `http://localhost:5078`
- HTTPS: `https://localhost:7116`

## Autenticación

Todas las operaciones requieren los siguientes headers:

| Header | Valor | Descripción |
|--------|-------|-------------|
| `Authorization` | `Bearer <JWT>` | Token emitido por MicroservicioLogin |
| `X-Usuario-Id` | `<GUID>` | Identificador del usuario que realiza la operación |

El token se valida contra el endpoint `POST /validate` de Login.  
Sin token o token inválido → `401 Unauthorized`.  
Si falta `X-Usuario-Id` o no es un GUID válido → `400 Bad Request`.

## Endpoints

| Método | Ruta | Descripción | Respuesta exitosa |
|--------|------|-------------|-------------------|
| POST | `/bitacora` | Registrar una bitácora | 201 Created |
| GET | `/bitacora` | Obtener todas las bitácoras (sin paginación) | 200 OK |
| GET | `/bitacora?pagina={n}` | Obtener bitácoras paginadas | 200 OK |

### POST /bitacora — Registrar

```http
POST /bitacora
Authorization: Bearer <JWT>
X-Usuario-Id: 00000000-0000-0000-0000-000000000001
Content-Type: application/json

{
  "descripcion": "Se creó el usuario juan.perez@cuc.cr"
}
```

El campo `Usuario` se toma del header `X-Usuario-Id` (se sobrescribe cualquier valor enviado en el body).

**Respuesta exitosa (`201 Created`):**

```json
{
  "mensaje": "Bitacora registrada correctamente"
}
```

### GET /bitacora — Listar todas

```http
GET /bitacora
Authorization: Bearer <JWT>
X-Usuario-Id: 00000000-0000-0000-0000-000000000001
```

**Respuesta:** `200 OK` con un arreglo de objetos `Bitacora`.

### GET /bitacora?pagina=1 — Listar paginado

Requiere el query parameter `pagina` ≥ 1.  
El tamaño de página se obtiene del parámetro `PAGSIZE` (MicroservicioParametros). Si no está disponible o es inválido, se usa el valor por defecto de **15**. El tamaño nunca supera 15.

**Respuesta (`200 OK`):**

```json
{
  "pagina": 1,
  "tamanoPagina": 15,
  "totalRegistros": 42,
  "totalPaginas": 3,
  "datos": [
    {
      "idBitacora": 1,
      "fechaBitacora": "2026-11-03T15:30:00",
      "usuario": "00000000-0000-0000-0000-000000000001",
      "descripcion": "Se creó el usuario juan.perez@cuc.cr"
    }
  ]
}
```

## Reglas de negocio / Validaciones

- El `Usuario` (GUID) es obligatorio y no puede ser vacío.
- La `Descripcion` es obligatoria y no puede ser vacía ni espacios en blanco.
- En paginación, `pagina` debe ser mayor o igual a 1.
- Las bitácoras se ordenan por fecha descendente y, en caso de empate, por `IdBitacora` descendente.

## Integraciones

| Servicio | Uso |
|----------|-----|
| Login (USR5) | Validar token JWT (`POST /validate`) |
| Parámetros | Obtener el valor de `PAGSIZE` para el tamaño de página |

## Configuración

Claves principales en `appsettings.json` / variables de entorno:

- `ConnectionStrings:SeguridadAuditoria` → Cadena de conexión a la base de datos de auditoría.
- `Servicios:LoginUrl` → URL base de MicroservicioLogin.
- `Servicios:ParametroUrl` → URL base de MicroservicioParametros.
- `Cors:AllowedOrigins` → Orígenes permitidos para CORS.

> **Nota de seguridad:** No versionar contraseñas ni credenciales en `appsettings.json`. Usar variables de entorno o secretos de Plesk en producción.

## Base de datos

Utiliza la base de datos de Seguridad / Auditoría.  
Tabla principal: `[MetaU_DB_User].[Bitacora]`  
Campos: `IdBitacora`, `FechaBitacora`, `Usuario`, `Descripcion`.

## Ejecución local

```bash
dotnet run --project Backend/MicroservicioBitacoras/MicroservicioBitacoras.csproj
```

## Respuestas y errores comunes

| Código | Cuándo ocurre |
|--------|---------------|
| 200 OK | Consulta exitosa |
| 201 Created | Bitácora registrada correctamente |
| 400 Bad Request | Datos inválidos, usuario ausente/inválido o página < 1 |
| 401 Unauthorized | Token ausente o inválido |
| 500 Internal Server Error | Error técnico no controlado |

## Diagrama de clases

![Diagrama de Clases Bitácoras](../../Documentacion/Diagramas%20Generales/Clases/Microservicios/DiagramaClases-Bitacora.png)

---

*Documentación estandarizada del microservicio MicroservicioBitacoras (GEN1).*
