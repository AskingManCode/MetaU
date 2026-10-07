# MAT2 - Administración de matrículas

Microservicio REST encargado de matricular estudiantes en cursos y grupos durante un período académico activo. Implementa las cuatro operaciones solicitadas por la HU MAT2, valida la autenticación mediante USR5 y registra las acciones mediante GEN1.

## Tecnologías

- .NET 10
- ASP.NET Core Minimal API
- Entity Framework Core 10
- SQL Server
- OpenAPI
- `HttpClient` para integrar Login, Bitácoras, Cursos, Grupos y Períodos

## Dirección local y endpoint base

El perfil HTTPS incluido en el proyecto utiliza `https://localhost:7070`. Todas las operaciones se publican bajo:

```text
/matricula
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

## Contrato de matrícula

### Request

| Campo | Tipo | Requerido | Descripción |
|---|---|---:|---|
| `identificacion` | `string` | Sí | Identificación de un estudiante activo registrado en `Matriculas_DB`. |
| `cursoCode` | `string` | Sí | Código de un curso existente. |
| `grupoCode` | `string` | Sí | Código del grupo en el cual se matricula el estudiante. Debe pertenecer al curso indicado. |
| `periodoID` | `Guid` | Sí | Identificador de un período activo. |

```json
{
  "identificacion": "123456789",
  "cursoCode": "CURSO1",
  "grupoCode": "GRUPO1",
  "periodoID": "11111111-1111-1111-1111-111111111111"
}
```

### Response

| Campo | Tipo | Descripción |
|---|---|---|
| `id` | `int` | Identificador del detalle `MatriculasXCursos`. Se utiliza en PUT y DELETE. |
| `matriculaID` | `Guid` | Identificador de la cabecera de matrícula. |
| `identificacion` | `string` | Identificación del estudiante. |
| `cursoCode` | `string` | Código del curso matriculado. |
| `grupoCode` | `string` | Código del grupo asignado. |
| `periodoID` | `Guid` | Identificador del período académico. |

```json
{
  "id": 25,
  "matriculaID": "22222222-2222-2222-2222-222222222222",
  "identificacion": "123456789",
  "cursoCode": "CURSO1",
  "grupoCode": "GRUPO1",
  "periodoID": "11111111-1111-1111-1111-111111111111"
}
```

Los identificadores y códigos de los ejemplos son ilustrativos. Deben sustituirse por datos existentes en el ambiente de ejecución.

## Matricular un estudiante

```http
POST /matricula
```

Request:

```json
{
  "identificacion": "123456789",
  "cursoCode": "CURSO1",
  "grupoCode": "GRUPO1",
  "periodoID": "11111111-1111-1111-1111-111111111111"
}
```

Respuesta exitosa:

```text
201 Created
Location: /matricula/{id}
```

El body contiene el detalle de matrícula creado. El servicio obtiene `CarreraCode` desde el microservicio de Cursos y lo utiliza para crear o localizar la cabecera de matrícula del estudiante en ese período.

Si la cabecera ya existe, el nuevo curso se agrega a la matrícula existente. Si el mismo curso estaba eliminado lógicamente, se reactiva y se actualiza su grupo.

Conflictos posibles:

```text
409 Conflict
```

```json
{
  "mensaje": "El estudiante ya está matriculado en ese curso para el periodo indicado."
}
```

```json
{
  "mensaje": "El grupo no tiene cupo disponible."
}
```

## Modificar una matrícula

```http
PUT /matricula/{id}
```

`id` corresponde al entero devuelto en el campo `id` del POST, no al GUID `matriculaID`.

Request:

```json
{
  "identificacion": "123456789",
  "cursoCode": "CURSO1",
  "grupoCode": "GRUPO2",
  "periodoID": "11111111-1111-1111-1111-111111111111"
}
```

Respuesta exitosa: `200 OK`.

La modificación solo permite cambiar `grupoCode`. La identificación, el curso y el período deben coincidir con la matrícula existente. Si alguno cambia, responde `400 Bad Request`:

```json
{
  "mensaje": "Solo se puede modificar el grupo de la matrícula; la identificación, el curso y el periodo no pueden cambiar."
}
```

Antes de asignar el grupo nuevo, el servicio verifica que pertenezca al curso y que tenga cupo disponible.

## Eliminar una matrícula

```http
DELETE /matricula/{id}
```

Respuesta exitosa: `204 No Content`.

La eliminación es lógica: el detalle de curso y grupo cambia a estado inactivo. La cabecera de la matrícula permanece almacenada.

## Obtener estudiantes matriculados por curso y grupo

```http
GET /matricula?cursoCode={cursoCode}&grupoCode={grupoCode}
```

Ejemplo:

```http
GET /matricula?cursoCode=CURSO1&grupoCode=GRUPO1
```

Respuesta exitosa: `200 OK`.

```json
[
  {
    "identificacion": "123456789",
    "tipoIdentificacion": "CEDULA",
    "nombreCompleto": "Estudiante de Prueba",
    "email": "estudiante@cuc.cr"
  }
]
```

La consulta solo incluye estudiantes, matrículas y detalles que se encuentren activos. `cursoCode` y `grupoCode` son obligatorios; si falta alguno, responde `400 Bad Request`.

## Obtener matrículas por estudiante

El código incluye una consulta adicional que no forma parte de las cuatro operaciones mínimas de la HU MAT2:

```http
GET /matricula?identificacion={identificacion}
```

Ejemplo:

```http
GET /matricula?identificacion=123456789
```

Respuesta exitosa: `200 OK`. Devuelve los detalles activos de matrícula asociados con el estudiante. Cuando se envía `identificacion`, esta consulta tiene prioridad sobre `cursoCode` y `grupoCode`.

## Reglas de negocio

- `identificacion`, `cursoCode`, `grupoCode` y `periodoID` son obligatorios.
- El estudiante debe existir y estar activo.
- El curso debe existir.
- El grupo debe existir y pertenecer al curso indicado.
- El período debe existir y estar activo.
- Un período está activo cuando la fecha actual se encuentra entre `FechaInicio` y `FechaFin`, inclusive.
- El número de detalles activos del grupo debe ser menor que su `Cupo`.
- Un estudiante no puede tener dos detalles activos para el mismo curso y período.
- Al modificar, solo se permite cambiar el grupo.
- La eliminación del detalle es lógica mediante el campo `Estado`.

## Integraciones

| Servicio | Operación utilizada | Finalidad |
|---|---|---|
| Login, HU USR5 | `POST /validate` | Validar el Bearer token. |
| Cursos | `GET /curso/{cursoCode}` | Confirmar que el curso existe y obtener su carrera. |
| Grupos | `GET /grupo/{grupoCode}` | Confirmar existencia, curso asociado y cupo. |
| Períodos | `GET /periodo/{periodoID}` | Confirmar que el período existe y está activo. |
| Bitácoras, HU GEN1 | `POST /bitacora` | Registrar operaciones y errores técnicos. |

El token y `X-Usuario-Id` recibidos se propagan a Cursos, Grupos, Períodos y Bitácoras.

## Bitácoras

El servicio intenta registrar:

- Creación: JSON del detalle de matrícula creado.
- Modificación: JSON de la versión anterior y la actual.
- Eliminación: JSON del detalle eliminado lógicamente.
- Consulta por curso y grupo: descripción de los filtros consultados.
- Consulta por estudiante: identificación consultada.
- Error no controlado: `Error técnico: {mensaje}`.

La integración está implementada como mejor esfuerzo: si el servicio de Bitácoras falla, la operación principal continúa.

## Respuestas HTTP

| Código | Descripción |
|---:|---|
| `200 OK` | Modificación o consulta completada. |
| `201 Created` | Detalle de matrícula creado o reactivado. |
| `204 No Content` | Detalle de matrícula eliminado lógicamente. |
| `400 Bad Request` | Faltan datos, el grupo no pertenece al curso, el período no está activo o se intentó modificar un campo inmutable. |
| `401 Unauthorized` | Token o identificador de usuario ausente o inválido. |
| `404 Not Found` | Matrícula, estudiante, curso, grupo o período inexistente. |
| `409 Conflict` | Curso duplicado en la matrícula o grupo sin cupo. |
| `500 Internal Server Error` | Error técnico no controlado. |

Los errores controlados usan este formato:

```json
{
  "mensaje": "Descripción del error"
}
```

## Persistencia

`Matriculas` almacena la cabecera por estudiante, carrera y período. `MatriculasXCursos` almacena cada combinación de curso y grupo. El identificador entero del detalle se utiliza para modificarlo o eliminarlo.

## Configuración

`appsettings.json` define:

```json
{
  "ConnectionStrings": {
    "DefaultConnection": "Server=TU_SERVIDOR;Database=Matriculas_DB;..."
  },
  "Servicios": {
    "LoginUrl": "https://localhost:7244",
    "BitacoraUrl": "https://localhost:7116",
    "CursoUrl": "https://localhost:7136",
    "GrupoUrl": "https://localhost:7157",
    "PeriodoUrl": "https://localhost:7256"
  }
}
```

Las URLs deben corresponder al ambiente de ejecución. No se deben versionar credenciales reales.

## Compilación

```bash
dotnet build Backend/MicroservicioMatriculas/MicroservicioMatriculas.csproj
```

## Ejecución

```bash
dotnet run --project Backend/MicroservicioMatriculas/MicroservicioMatriculas.csproj
```

El proyecto incluye `MicroservicioMatriculas.http` con ejemplos de las cuatro operaciones principales. Antes de ejecutarlo, se deben completar `Token`, `UsuarioId`, `MatriculaId`, los códigos y el identificador del período.

