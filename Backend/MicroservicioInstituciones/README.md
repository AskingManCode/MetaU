# Microservicio de Instituciones - ACD1

Servicio REST para administrar las instituciones educativas registradas en MetaU.

## Historia de usuario

**ACD1** — Servicio para Administrar Instituciones.

Permite crear, modificar, eliminar (lógicamente) y consultar instituciones educativas.

## Tecnologías

- .NET 10
- ASP.NET Core Minimal APIs
- Dapper (SQL directo) sobre SQL Server
- Autenticación mediante Bearer Token (MicroservicioLogin)
- Registro de acciones en Bitácoras

## Endpoint base

`/institucion`

**URL base en producción:**  
`https://tiusr20pl.cuc-carrera-ti.ac.cr/MicroservicioInstituciones_MetaU`

**URLs locales** (desde `Properties/launchSettings.json`):

- HTTP: `http://localhost:5070`
- HTTPS: `https://localhost:7205`

## Autenticación

Todas las operaciones requieren los siguientes headers:

| Header | Valor | Descripción |
|--------|-------|-------------|
| `Authorization` | `Bearer <JWT>` | Token emitido por MicroservicioLogin |
| `X-Usuario-Id` | `<GUID>` | Identificador del usuario que realiza la operación |

El token se valida contra `POST /validate` de Login.  
Sin token o token inválido → `401 Unauthorized`.  
Si falta `X-Usuario-Id` o no es un GUID válido → `400 Bad Request`.

## Endpoints

| Método | Ruta | Descripción | Respuesta exitosa |
|--------|------|-------------|-------------------|
| POST | `/institucion` | Crear una institución | 201 Created |
| PUT | `/institucion/{id}` | Modificar una institución | 200 OK |
| DELETE | `/institucion/{id}` | Eliminar una institución (lógicamente) | 204 No Content |
| GET | `/institucion` | Obtener todas las instituciones activas | 200 OK |
| GET | `/institucion/{id}` | Obtener una institución por código | 200 OK |

### POST /institucion — Crear

```http
POST /institucion
Authorization: Bearer <JWT>
X-Usuario-Id: 00000000-0000-0000-0000-000000000001
Content-Type: application/json

{
  "institucionCode": "CUC",
  "nombre": "Colegio Universitario de Cartago"
}
```

**Respuesta exitosa (`201 Created`):** el objeto `Institucion` creado (con `estado: true`).

### PUT /institucion/{id} — Modificar

Solo se puede modificar el `nombre`. El código no cambia.

```http
PUT /institucion/CUC
Authorization: Bearer <JWT>
X-Usuario-Id: 00000000-0000-0000-0000-000000000001
Content-Type: application/json

{
  "nombre": "Colegio Universitario de Cartago"
}
```

**Respuesta:** `200 OK` con el objeto actualizado.

### DELETE /institucion/{id} — Eliminar

Eliminación lógica (`Estado = false`).

```http
DELETE /institucion/CUC
Authorization: Bearer <JWT>
X-Usuario-Id: 00000000-0000-0000-0000-000000000001
```

**Respuesta:** `204 No Content`.

### GET /institucion y GET /institucion/{id}

```http
GET /institucion
GET /institucion/CUC
Authorization: Bearer <JWT>
X-Usuario-Id: 00000000-0000-0000-0000-000000000001
```

## Formato de datos

```json
{
  "institucionCode": "CUC",
  "nombre": "Colegio Universitario de Cartago",
  "estado": true
}
```

## Reglas de negocio / Validaciones

- `institucionCode` y `nombre` son obligatorios.
- El `nombre` solo puede contener letras y espacios.
- El `institucionCode` debe ser único.
- Solo se pueden consultar y modificar instituciones activas.
- La eliminación es lógica (`Estado = false`).

## Integraciones

| Servicio | Uso |
|----------|-----|
| Login (USR5) | Validar token JWT |
| Bitácoras (GEN1) | Registrar operaciones (mejor esfuerzo) |

## Configuración

Claves principales en `appsettings.json` / variables de entorno:

- `ConnectionStrings:OfertaAcademica` → Cadena de conexión a `Oferta_Academica_DB`.
- `Servicios:LoginUrl` → URL base de MicroservicioLogin.
- `Servicios:BitacorasUrl` → URL base de MicroservicioBitacoras.

> **Nota de seguridad:** No versionar contraseñas ni credenciales. Usar variables de entorno o secretos de Plesk en producción.

## Base de datos

**Base de datos:** `Oferta_Academica_DB` (compartida con Carreras, Cursos, Grupos y Profesores).  
Tabla principal: Instituciones.

## Ejecución local

```bash
dotnet run --project Backend/MicroservicioInstituciones/MicroservicioInstituciones.csproj
```

## Respuestas y errores comunes

| Código | Cuándo ocurre |
|--------|---------------|
| 200 OK | Consulta o modificación exitosa |
| 201 Created | Institución creada |
| 204 No Content | Institución eliminada (lógicamente) |
| 400 Bad Request | Datos inválidos, campos vacíos o nombre con caracteres no permitidos |
| 401 Unauthorized | Token ausente o inválido |
| 404 Not Found | Institución no encontrada o inactiva |
| 409 Conflict | Ya existe una institución con el mismo código |
| 500 Internal Server Error | Error técnico no controlado |

## Diagrama de clases

![Diagrama de Clases Instituciones](../../Documentacion/Diagramas%20Generales/Clases/Microservicios/DiagramaClases_AdministracionInstituciones.drawio.png)

---

*Documentación estandarizada del microservicio MicroservicioInstituciones (ACD1).*
