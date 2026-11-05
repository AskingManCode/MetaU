# Microservicio de Prematrículas - MAT1

Microservicio encargado de la administración de prematrículas de estudiantes.

## Historia de usuario

**MAT1** — Administración de prematrículas.

Permite crear, modificar, eliminar (lógicamente) y consultar prematrículas de estudiantes para cursos de primer nivel y períodos futuros.

## Tecnologías

- .NET 10
- ASP.NET Core Minimal APIs
- Dapper (SQL directo) sobre SQL Server
- Autenticación mediante ****** (MicroservicioLogin)
- Registro de acciones en Bitácoras
- Integración con Carreras, Cursos y Períodos
- Consulta de parámetros para paginación

## Endpoint base

`/prematricula`

**URL base en producción:**  
`https://tiusr20pl.cuc-carrera-ti.ac.cr/MicroservicioPreMatriculas_MetaU`

**URLs locales** (desde `Properties/launchSettings.json`):

- HTTP: `http://localhost:5232`
- HTTPS: `https://localhost:7236`

## Autenticación

Todas las operaciones requieren los siguientes headers:

| Header | Valor | Descripción |
|--------|-------|-------------|
| `Authorization` | `******` | Token emitido por MicroservicioLogin |
| `X-Usuario-Id` | `<GUID>` | Identificador del usuario que realiza la operación |

El token se valida contra `POST /validate` de Login.  
Sin token o token inválido → `401 Unauthorized`.  
Si falta `X-Usuario-Id` o no es un GUID válido → `401 Unauthorized`.

## Endpoints

| Método | Ruta | Descripción | Respuesta exitosa |
|--------|------|-------------|-------------------|
| POST | `/prematricula` | Crear una prematrícula | 201 Created |
| PUT | `/prematricula/{id}` | Modificar una prematrícula | 200 OK |
| DELETE | `/prematricula/{id}` | Eliminar una prematrícula (lógicamente) | 204 No Content |
| GET | `/prematricula` | Obtener todas las prematrículas activas | 200 OK |
| GET | `/prematricula?pagina={n}` | Obtener prematrículas paginadas | 200 OK |
| GET | `/prematricula/{id}` | Obtener una prematrícula por ID | 200 OK |

`id` debe ser un GUID válido.

### POST /prematricula — Crear

```http
POST /prematricula
Authorization: ******
X-Usuario-Id: 00000000-0000-0000-0000-000000000001
Content-Type: application/json

{
  "identificacion": "123456789",
  "carreraCode": "CARRERA1",
  "cursos": ["CURSO1", "CURSO2"],
  "observaciones": "Solicita horario nocturno",
  "periodoID": "11111111-1111-1111-1111-111111111111"
}
```

**Respuesta exitosa (`201 Created`):** la prematrícula creada, con un header `Location` que apunta a `/prematricula/{id}`.

Si ya existe una prematrícula activa para la misma combinación de estudiante, carrera y período, responde `409 Conflict`. Si existe una prematrícula inactiva para esa combinación, se reactiva, se actualizan sus cursos y observaciones, y responde `201 Created`.

### PUT /prematricula/{id} — Modificar

```http
PUT /prematricula/22222222-2222-2222-2222-222222222222
Authorization: ******
X-Usuario-Id: 00000000-0000-0000-0000-000000000001
Content-Type: application/json

{
  "identificacion": "123456789",
  "carreraCode": "CARRERA1",
  "cursos": ["CURSO1"],
  "observaciones": "Horario actualizado",
  "periodoID": "11111111-1111-1111-1111-111111111111"
}
```

**Respuesta:** `200 OK` con la prematrícula actualizada. La operación vuelve a validar el estudiante, la carrera, los cursos y el período. Si la combinación de estudiante, carrera y período ya pertenece a otra prematrícula, responde `409 Conflict`.

### DELETE /prematricula/{id} — Eliminar

La eliminación es lógica: cambia a inactivo el registro y todos sus cursos.

```http
DELETE /prematricula/22222222-2222-2222-2222-222222222222
Authorization: ******
X-Usuario-Id: 00000000-0000-0000-0000-000000000001
```

**Respuesta:** `204 No Content`.

### GET /prematricula y GET /prematricula/{id}

```http
GET /prematricula
GET /prematricula/22222222-2222-2222-2222-222222222222
Authorization: ******
X-Usuario-Id: 00000000-0000-0000-0000-000000000001
```

La consulta de la colección devuelve únicamente prematrículas activas y, si no hay registros, devuelve una lista vacía. La consulta individual también devuelve solo prematrículas activas; si el ID no existe o corresponde a un registro inactivo, responde `404 Not Found`.

### Paginación

Agregar `?pagina=1` (valor ≥ 1). El tamaño de página se obtiene del parámetro `PAGSIZE` (por defecto **15**, nunca superior a 15). Si el parámetro no está disponible o no contiene un entero positivo, se utiliza el valor por defecto. Los resultados se ordenan por período, identificación y, en caso de empate, por ID de prematrícula.

```http
GET /prematricula?pagina=1
Authorization: ******
X-Usuario-Id: 00000000-0000-0000-0000-000000000001
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
      "id": "22222222-2222-2222-2222-222222222222",
      "identificacion": "123456789",
      "carreraCode": "CARRERA1",
      "cursos": ["CURSO1", "CURSO2"],
      "observaciones": "Solicita horario nocturno",
      "periodoID": "11111111-1111-1111-1111-111111111111"
    }
  ]
}
```

## Formato de datos

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

Los identificadores y códigos de los ejemplos son ilustrativos y deben sustituirse por datos existentes en el ambiente.

## Reglas de negocio / Validaciones

- `identificacion`, `carreraCode`, `cursos` y `periodoID` son obligatorios; los campos requeridos no pueden estar vacíos ni contener solo espacios.
- La lista `cursos` debe contener al menos un código no vacío. Los códigos repetidos se eliminan sin distinguir entre mayúsculas y minúsculas.
- `observaciones` es opcional y admite hasta 300 caracteres; si está vacía o contiene solo espacios, se almacena como `null`. Se eliminan los espacios externos y se normalizan los espacios internos repetidos.
- El estudiante debe existir y estar activo.
- La carrera debe existir y estar activa.
- El período debe existir y su `fechaInicio` debe ser posterior al día actual del servidor.
- Cada curso debe existir, pertenecer a la carrera indicada y tener `nivel` igual a `1`.
- La combinación de estudiante, carrera y período debe ser única. Una prematrícula inactiva con esa combinación se reactiva al crearla nuevamente.
- La eliminación es lógica y desactiva también los cursos asociados.
- Para paginar, `pagina` debe ser mayor o igual a 1.

## Integraciones

| Servicio | Uso |
|----------|-----|
| Login (USR5) | Validar token JWT |
| Bitácoras (GEN1) | Registrar operaciones y errores técnicos (mejor esfuerzo) |
| Carreras | Validar que la carrera exista y esté activa |
| Cursos | Validar que los cursos existan, pertenezcan a la carrera y sean de primer nivel |
| Períodos | Validar que el período exista y sea futuro |
| Parámetros | Obtener `PAGSIZE` para paginación |

El token y `X-Usuario-Id` recibidos se propagan a los servicios integrados que los requieren.

## Configuración

Claves principales en `appsettings.json` / variables de entorno:

- `ConnectionStrings:Matriculas` → Cadena de conexión a `Matriculas_DB`.
- `Servicios:LoginUrl` → URL base de MicroservicioLogin.
- `Servicios:BitacoraUrl` → URL base de MicroservicioBitacoras.
- `Servicios:CarreraUrl` → URL base de MicroservicioCarreras.
- `Servicios:CursoUrl` → URL base de MicroservicioCursos.
- `Servicios:PeriodoUrl` → URL base de MicroservicioPeriodos.
- `Servicios:ParametroUrl` → URL base de MicroservicioParametros.
- `Cors:AllowedOrigins` → Orígenes permitidos para CORS.

> **Nota de seguridad:** No versionar contraseñas ni credenciales. Usar variables de entorno o secretos de Plesk en producción.

## Base de datos

**Base de datos:** `Matriculas_DB`  
Tablas principales: `Estudiantes`, `PreMatriculas`, `PreMatriculasXCursos`.

## Ejecución local

```bash
dotnet run --project Backend/MicroservicioPreMatriculas/MicroservicioPreMatriculas.csproj
```

## Respuestas y errores comunes

| Código | Cuándo ocurre |
|--------|---------------|
| 200 OK | Consulta o modificación exitosa |
| 201 Created | Prematrícula creada o reactivada |
| 204 No Content | Prematrícula eliminada lógicamente |
| 400 Bad Request | Datos inválidos, período no futuro, curso que no pertenece a la carrera o que no es de primer nivel, o página < 1 |
| 401 Unauthorized | Token o `X-Usuario-Id` ausente/inválido |
| 404 Not Found | Prematrícula, estudiante, carrera, curso o período no encontrado |
| 409 Conflict | Ya existe una prematrícula activa para la combinación de estudiante, carrera y período |
| 500 Internal Server Error | Error técnico no controlado |

## Diagrama de clases

![Diagrama de Clases Prematrículas](../../Documentacion/Diagramas%20Generales/Clases/Microservicios/DiagramaClases-PreMatricula.png)

---

*Documentación estandarizada del microservicio MicroservicioPreMatriculas (MAT1).*
