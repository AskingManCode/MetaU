# MAT1 - Administración de prematrículas

Microservicio REST encargado de administrar la prematrícula de estudiantes en cursos de primer nivel y períodos futuros. Implementa las cinco operaciones solicitadas por la HU MAT1, valida la autenticación mediante USR5 y registra las acciones mediante GEN1.

## Tecnologías

- .NET 10
- ASP.NET Core Minimal API
- Entity Framework Core 10
- SQL Server
- OpenAPI
- `HttpClient` para integrar Login, Bitácoras, Cursos y Períodos

## Dirección local y endpoint base

El perfil HTTPS incluido en el proyecto utiliza `https://localhost:7236`. Todas las operaciones se publican bajo:

```text
/prematricula
```

## Autenticación

Todas las operaciones requieren estos headers:

```http
Authorization: Bearer {token}
X-Usuario-Id: {guid}
```

Antes de ejecutar una operación, el microservicio envía el token al endpoint `POST /validate` del servicio de Login. Responde `401 Unauthorized` cuando falta el token, `X-Usuario-Id` no contiene un GUID válido o Login rechaza el token.

```json
{
  "mensaje": "No autorizado"
}
```

## Contratos de datos

### Request

| Campo | Tipo | Requerido | Descripción |
|---|---|---:|---|
| `identificacion` | `string` | Sí | Identificación de un estudiante activo registrado en `Estudiantes`. |
| `carreraCode` | `string` | Sí | Código de la carrera a la que desea ingresar. |
| `cursos` | `string[]` | Sí | Uno o más códigos de cursos de primer nivel. |
| `observaciones` | `string` o `null` | No | Comentario opcional. Los espacios externos se eliminan y los espacios internos repetidos se normalizan. |
| `periodoID` | `Guid` | Sí | Identificador de un período cuya fecha de inicio sea posterior a la fecha actual. |

```json
{
  "identificacion": "123456789",
  "carreraCode": "CARRERA1",
  "cursos": ["CURSO1", "CURSO2"],
  "observaciones": "Solicita horario nocturno",
  "periodoID": "11111111-1111-1111-1111-111111111111"
}
```

### Response

| Campo | Tipo | Descripción |
|---|---|---|
| `id` | `Guid` | Llave primaria de la prematrícula. |
| `identificacion` | `string` | Identificación del estudiante. |
| `carreraCode` | `string` | Código de la carrera. |
| `cursos` | `string[]` | Cursos activos asociados con la prematrícula. |
| `observaciones` | `string` o `null` | Observaciones normalizadas. |
| `periodoID` | `Guid` | Identificador del período. |

```json
{
  "id": "22222222-2222-2222-2222-222222222222",
  "identificacion": "123456789",
  "carreraCode": "CARRERA1",
  "cursos": ["CURSO1", "CURSO2"],
  "observaciones": "Solicita horario nocturno",
  "periodoID": "11111111-1111-1111-1111-111111111111"
}
```

Los identificadores y códigos de los ejemplos son ilustrativos. Deben sustituirse por datos existentes en el ambiente de ejecución.

## Crear una prematrícula

```http
POST /prematricula
```

Request:

```json
{
  "identificacion": "123456789",
  "carreraCode": "CARRERA1",
  "cursos": ["CURSO1", "CURSO2"],
  "observaciones": "Opcional",
  "periodoID": "11111111-1111-1111-1111-111111111111"
}
```

Respuesta exitosa:

```text
201 Created
Location: /prematricula/{id}
```

El body contiene la prematrícula creada. Si ya existe una prematrícula activa para la misma combinación de estudiante, carrera y período, responde `409 Conflict`:

```json
{
  "mensaje": "El estudiante ya tiene una prematrícula para esa carrera y periodo."
}
```

Si el registro coincidente existe, pero estaba eliminado lógicamente, la operación lo reactiva, actualiza sus observaciones y cursos, y responde `201 Created`.

## Modificar una prematrícula

```http
PUT /prematricula/{id}
```

Request:

```json
{
  "identificacion": "123456789",
  "carreraCode": "CARRERA1",
  "cursos": ["CURSO1"],
  "observaciones": "Modificada",
  "periodoID": "11111111-1111-1111-1111-111111111111"
}
```

Respuesta exitosa: `200 OK`. El body contiene la versión actualizada. La operación vuelve a validar el estudiante, los cursos y el período. Si la combinación resultante pertenece a otra prematrícula, responde `409 Conflict`.

## Eliminar una prematrícula

```http
DELETE /prematricula/{id}
```

Respuesta exitosa: `204 No Content`. La eliminación es lógica: cambia a inactivo el registro y todos sus cursos. El endpoint no devuelve body.

## Obtener todas las prematrículas

```http
GET /prematricula
```

Respuesta exitosa: `200 OK`.

```json
[
  {
    "id": "22222222-2222-2222-2222-222222222222",
    "identificacion": "123456789",
    "carreraCode": "CARRERA1",
    "cursos": ["CURSO1", "CURSO2"],
    "observaciones": "Opcional",
    "periodoID": "11111111-1111-1111-1111-111111111111"
  }
]
```

Solo se incluyen prematrículas activas. Si no existen registros, devuelve una lista vacía.

## Obtener una prematrícula por llave primaria

```http
GET /prematricula/{id}
```

Respuesta exitosa: `200 OK`. Devuelve únicamente una prematrícula activa. Un GUID inexistente o perteneciente a un registro inactivo responde `404 Not Found`.

## Reglas de negocio

- `identificacion`, `carreraCode`, `cursos` y `periodoID` son obligatorios.
- La lista de cursos debe contener al menos un valor no vacío.
- `observaciones` es opcional; un valor vacío o compuesto solo por espacios se almacena como `null`.
- El estudiante debe existir y estar activo.
- El período debe existir y su `fechaInicio` debe ser posterior al día actual del servidor.
- Cada curso debe existir y tener `nivel` igual a `1`.
- Los códigos de curso repetidos se eliminan sin distinguir entre mayúsculas y minúsculas.
- La combinación estudiante, carrera y período no se puede duplicar entre prematrículas distintas.
- Las eliminaciones son lógicas mediante el campo `Estado`.

## Integraciones

| Servicio | Operación utilizada | Finalidad |
|---|---|---|
| Login, HU USR5 | `POST /validate` | Validar el Bearer token. |
| Cursos | `GET /curso/{cursoCode}` | Confirmar que el curso existe y es de primer nivel. |
| Períodos | `GET /periodo/{periodoID}` | Confirmar que el período existe y es futuro. |
| Bitácoras, HU GEN1 | `POST /bitacora` | Registrar operaciones y errores técnicos. |

El token y `X-Usuario-Id` recibidos se propagan a Cursos, Períodos y Bitácoras.

## Bitácoras

El servicio intenta registrar:

- Creación: JSON de la nueva prematrícula.
- Modificación: JSON de la versión anterior y la actual.
- Eliminación: JSON del registro eliminado lógicamente.
- Consulta general: `El usuario consulta las prematrículas`.
- Consulta individual: `El usuario consulta la prematrícula {id}`.
- Error no controlado: `Error técnico: {mensaje}`.

La integración está implementada como mejor esfuerzo: si el servicio de Bitácoras falla, la operación principal continúa.

## Respuestas HTTP

| Código | Descripción |
|---:|---|
| `200 OK` | Modificación o consulta completada. |
| `201 Created` | Prematrícula creada o reactivada. |
| `204 No Content` | Prematrícula eliminada lógicamente. |
| `400 Bad Request` | Faltan datos, el período no es futuro o un curso no es de primer nivel. |
| `401 Unauthorized` | Token o identificador de usuario ausente o inválido. |
| `404 Not Found` | Prematrícula, estudiante, curso o período inexistente. |
| `409 Conflict` | Ya existe una prematrícula para la combinación indicada. |
| `500 Internal Server Error` | Error técnico no controlado. |

Los errores controlados usan este formato:

```json
{
  "mensaje": "Descripción del error"
}
```

## Persistencia

La cabecera se almacena en `PreMatriculas` y el detalle de cursos en `PreMatriculasXCursos`. Entity Framework Core carga el estudiante y los cursos relacionados para construir cada response.

## Configuración

`appsettings.json` define:

```json
{
  "ConnectionStrings": {
    "DefaultConnection": "Server=TU_SERVIDOR;Database=Matriculas_DB;..."
  },
  "Servicios": {
    "LoginUrl": "https://localhost:57074",
    "BitacoraUrl": "https://localhost:7116",
    "CursoUrl": "https://localhost:7136",
    "PeriodoUrl": "https://localhost:7256"
  }
}
```

Las URLs deben corresponder al ambiente de ejecución. No se deben versionar credenciales reales.

## Compilación

```bash
dotnet build Backend/MicroservicioPreMatriculas/MicroservicioPreMatriculas.csproj
```

## Ejecución

```bash
dotnet run --project Backend/MicroservicioPreMatriculas/MicroservicioPreMatriculas.csproj
```

El proyecto incluye `MicroservicioPreMatriculas.http` con ejemplos de las cinco operaciones. Antes de ejecutarlo, se deben completar `Token`, `UsuarioId`, `PrematriculaId`, los códigos y el identificador del período.

