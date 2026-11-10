# Microservicio de Expedientes de Estudiantes - MAT3

Microservicio REST encargado de crear, modificar, eliminar (lógicamente) y consultar los expedientes de estudiantes.

## Historia de usuario

**MAT3** — Administración de expedientes de estudiantes.

Implementa las operaciones de gestión de expedientes, valida el dominio institucional mediante parametrización (`DOMEST`), verifica la autenticación mediante USR5 y registra las acciones mediante GEN1.

## Tecnologías

- .NET 10
- ASP.NET Core Minimal APIs
- Entity Framework Core 10
- SQL Server
- Autenticación mediante Bearer Token (MicroservicioLogin)
- Registro de acciones en Bitácoras
- Consulta de parámetros para dominio de email

## Endpoint base

`/expediente`

**URL base en producción:**  
`https://tiusr20pl.cuc-carrera-ti.ac.cr/MicroservicioExpedientesEstudiantes_MetaU`

**URLs locales** (desde `Properties/launchSettings.json`):

- HTTP: `http://localhost:5017`
- HTTPS: `https://localhost:7113`

## Autenticación

Todas las operaciones requieren los siguientes headers:

| Header | Valor | Descripción |
|--------|-------|-------------|
| `Authorization` | `Bearer <JWT>` | Token emitido por MicroservicioLogin |
| `X-Usuario-Id` | `<GUID>` | Identificador del usuario que realiza la operación |

El token se valida contra `POST /validate` de Login.  
Sin token o token inválido → `401 Unauthorized`.  
Si falta `X-Usuario-Id` o no es un GUID válido → `401 Unauthorized`.

## Endpoints

| Método | Ruta | Descripción | Respuesta exitosa |
|--------|------|-------------|-------------------|
| POST | `/expediente` | Crear un expediente | 201 Created |
| PUT | `/expediente/{identificacion}` | Modificar un expediente | 200 OK |
| DELETE | `/expediente/{identificacion}` | Eliminar un expediente (lógicamente) | 204 No Content |
| GET | `/expediente` | Obtener todos los expedientes activos | 200 OK |
| GET | `/expediente?pagina={n}` | Obtener expedientes paginados | 200 OK |
| GET | `/expediente/{identificacion}` | Obtener un expediente por identificación | 200 OK |

### POST /expediente — Crear

```http
POST /expediente
Authorization: Bearer <JWT>
X-Usuario-Id: 00000000-0000-0000-0000-000000000001
Content-Type: application/json

{
  "identificacion": "402230980",
  "tipoIdentificacion": "NACIONAL",
  "email": "kev.hernandez@cuc.cr",
  "nombreCompleto": "Kev Josue Hernandez Ulate",
  "fechaNacimiento": "2002-05-15",
  "provinciaID": "11111111-1111-1111-1111-111111111111",
  "cantonID": "22222222-2222-2222-2222-222222222222",
  "distritoID": "33333333-3333-3333-3333-333333333333",
  "otrasSenas": "De la iglesia doscientos metros al norte",
  "telefonos": ["88887777", "22223333"]
}
```

**Respuesta exitosa (`201 Created`):** el objeto expediente creado (incluye `estudianteID`, dirección agrupada y teléfonos).  
Si la identificación corresponde a un expediente eliminado lógicamente, se reactiva y actualiza.

### PUT /expediente/{identificacion} — Modificar

```http
PUT /expediente/402230980
Authorization: Bearer <JWT>
X-Usuario-Id: 00000000-0000-0000-0000-000000000001
Content-Type: application/json

{
  "identificacion": "402230980",
  "tipoIdentificacion": "NACIONAL",
  "email": "kev.hernandez@cuc.cr",
  "nombreCompleto": "Kev Josue Hernandez Ulate",
  "fechaNacimiento": "2002-05-15",
  "provinciaID": "11111111-1111-1111-1111-111111111111",
  "cantonID": "22222222-2222-2222-2222-222222222222",
  "distritoID": "33333333-3333-3333-3333-333333333333",
  "otrasSenas": "Nueva seña",
  "telefonos": ["88887777"]
}
```

La lista de teléfonos anterior se reemplaza completamente.

### DELETE /expediente/{identificacion} — Eliminar

Eliminación lógica (`estado = false`).

```http
DELETE /expediente/402230980
Authorization: Bearer <JWT>
X-Usuario-Id: 00000000-0000-0000-0000-000000000001
```

**Respuesta:** `204 No Content`.

### GET /expediente y GET /expediente/{identificacion}

```http
GET /expediente
GET /expediente/402230980
Authorization: Bearer <JWT>
X-Usuario-Id: 00000000-0000-0000-0000-000000000001
```

### Paginación

Agregar `?pagina=1` (valor ≥ 1). El tamaño de página se obtiene del parámetro `PAGSIZE` (por defecto **15**).

## Formato de respuesta

```json
{
  "estudianteID": "11111111-1111-1111-1111-111111111111",
  "usuarioID": null,
  "identificacion": "402230980",
  "tipoIdentificacion": "NACIONAL",
  "email": "kev.hernandez@cuc.cr",
  "nombreCompleto": "Kev Josue Hernandez Ulate",
  "fechaNacimiento": "2002-05-15",
  "direccion": {
    "provinciaID": "11111111-1111-1111-1111-111111111111",
    "cantonID": "22222222-2222-2222-2222-222222222222",
    "distritoID": "33333333-3333-3333-3333-333333333333",
    "otrasSenas": "De la iglesia doscientos metros al norte"
  },
  "estado": true,
  "telefonos": [
    {
      "telefonoXEstudiante": 1,
      "estudianteID": "11111111-1111-1111-1111-111111111111",
      "numero": "88887777"
    }
  ]
}
```

## Reglas de negocio / Validaciones

- Todos los campos son obligatorios.
- Los textos no pueden estar vacíos ni contener solo espacios.
- `provinciaID`, `cantonID` y `distritoID` deben ser GUID válidos distintos de vacío.
- Debe haber al menos un teléfono no vacío. Los teléfonos repetidos se normalizan.
- El `nombreCompleto` solo admite letras y espacios (se normalizan espacios repetidos).
- El email debe tener formato válido y pertenecer al dominio definido por el parámetro `DOMEST` (por defecto `cuc.cr`).
- La identificación debe ser única entre expedientes activos.
- El email es único incluso frente a expedientes eliminados lógicamente.
- La eliminación es lógica. Un POST posterior con la misma identificación puede reactivar el expediente.
- Al modificar, la lista de teléfonos se reemplaza por completo.

## Integraciones

| Servicio | Uso |
|----------|-----|
| Login (USR5) | Validar token JWT |
| Bitácoras (GEN1) | Registrar operaciones (mejor esfuerzo) |
| Parámetros | Obtener `DOMEST` (dominio de email) y `PAGSIZE` |

## Configuración

Claves principales en `appsettings.json` / variables de entorno:

- `ConnectionStrings:Matriculas` → Cadena de conexión a `Matriculas_DB`.
- `Servicios:LoginUrl` → URL base de MicroservicioLogin.
- `Servicios:BitacoraUrl` → URL base de MicroservicioBitacoras.
- `Servicios:ParametroUrl` → URL base de MicroservicioParametros.

> **Nota de seguridad:** No versionar contraseñas ni credenciales. Usar variables de entorno o secretos de Plesk en producción.

## Base de datos

**Base de datos:** `Matriculas_DB`  
Tablas principales: `Estudiantes`, `TelefonosXEstudiantes`.

## Ejecución local

```bash
dotnet run --project Backend/MicroservicioExpedientesEstudiantes/MicroservicioExpedientesEstudiantes.csproj
```

## Respuestas y errores comunes

| Código | Cuándo ocurre |
|--------|---------------|
| 200 OK | Consulta o modificación exitosa |
| 201 Created | Expediente creado o reactivado |
| 204 No Content | Expediente eliminado lógicamente |
| 400 Bad Request | Datos inválidos, campos vacíos, nombre con caracteres no permitidos, email inválido o dominio incorrecto |
| 401 Unauthorized | Token o `X-Usuario-Id` ausente/inválido |
| 404 Not Found | Expediente no encontrado o inactivo |
| 409 Conflict | Identificación o email duplicado |
| 500 Internal Server Error | Error técnico no controlado |

## Diagrama de clases

![Diagrama de Clases Expedientes](../../Documentacion/Diagramas%20Generales/Clases/Microservicios/DiagramaClases_AdministracionExpedientes.png)

---

*Documentación estandarizada del microservicio MicroservicioExpedientesEstudiantes (MAT3).*
