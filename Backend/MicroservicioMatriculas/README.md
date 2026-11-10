# Microservicio de Matrículas - MAT2

Microservicio REST encargado de matricular estudiantes en cursos y grupos durante un período académico activo.

## Historia de usuario

**MAT2** — Administración de matrículas.

Implementa las operaciones de matricular, modificar, eliminar (lógicamente) y consultar matrículas. Valida la autenticación mediante USR5 y registra las acciones mediante GEN1.

## Tecnologías

- .NET 10
- ASP.NET Core Minimal APIs
- Entity Framework Core 10
- SQL Server
- Autenticación mediante Bearer Token (MicroservicioLogin)
- Registro de acciones en Bitácoras
- Integración con Cursos, Grupos y Períodos

## Endpoint base

`/matricula`

**URL base en producción:**  
`https://tiusr20pl.cuc-carrera-ti.ac.cr/MicroservicioMatriculas_MetaU`

**URLs locales** (desde `Properties/launchSettings.json`):

- HTTP: `http://localhost:5163`
- HTTPS: `https://localhost:7070`

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
| POST | `/matricula` | Matricular un estudiante | 201 Created |
| PUT | `/matricula/{id}` | Modificar una matrícula (solo el grupo) | 200 OK |
| DELETE | `/matricula/{id}` | Eliminar una matrícula (lógicamente) | 204 No Content |
| GET | `/matricula?cursoCode={}&grupoCode={}` | Obtener estudiantes matriculados por curso y grupo | 200 OK |
| GET | `/matricula?identificacion={}` | Obtener matrículas por estudiante | 200 OK |
| GET | `/matricula?...&pagina={n}` | Versiones paginadas de las consultas | 200 OK |

### POST /matricula — Matricular

```http
POST /matricula
Authorization: Bearer <JWT>
X-Usuario-Id: 00000000-0000-0000-0000-000000000001
Content-Type: application/json

{
  "identificacion": "123456789",
  "cursoCode": "CURSO1",
  "grupoCode": "GRUPO1",
  "periodoID": "11111111-1111-1111-1111-111111111111"
}
```

**Respuesta exitosa (`201 Created`):** el detalle de matrícula creado.  
Si la cabecera ya existe, el curso se agrega. Si el mismo curso estaba eliminado lógicamente, se reactiva.

### PUT /matricula/{id} — Modificar

Solo permite cambiar el `grupoCode`. `id` es el entero del detalle (`MatriculasXCursos`), no el GUID de la cabecera.

```http
PUT /matricula/25
Authorization: Bearer <JWT>
X-Usuario-Id: 00000000-0000-0000-0000-000000000001
Content-Type: application/json

{
  "identificacion": "123456789",
  "cursoCode": "CURSO1",
  "grupoCode": "GRUPO2",
  "periodoID": "11111111-1111-1111-1111-111111111111"
}
```

### DELETE /matricula/{id} — Eliminar

Eliminación lógica del detalle.

```http
DELETE /matricula/25
Authorization: Bearer <JWT>
X-Usuario-Id: 00000000-0000-0000-0000-000000000001
```

**Respuesta:** `204 No Content`.

### Consultas

```http
GET /matricula?cursoCode=CURSO1&grupoCode=GRUPO1
GET /matricula?identificacion=123456789
Authorization: Bearer <JWT>
X-Usuario-Id: 00000000-0000-0000-0000-000000000001
```

### Paginación

Agregar `&pagina=1` (valor ≥ 1). El tamaño de página se obtiene del parámetro `PAGSIZE` (por defecto **15**).

## Formato de respuesta (detalle)

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

## Formato de consulta por curso/grupo

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

## Reglas de negocio / Validaciones

- `identificacion`, `cursoCode`, `grupoCode` y `periodoID` son obligatorios.
- El estudiante debe existir y estar activo.
- El curso debe existir.
- El grupo debe existir, pertenecer al curso indicado y tener cupo disponible.
- El período debe existir y estar activo (fecha actual entre `FechaInicio` y `FechaFin`).
- Un estudiante no puede tener dos detalles activos para el mismo curso y período.
- Al modificar, solo se permite cambiar el grupo (identificación, curso y período deben coincidir).
- La eliminación del detalle es lógica. La cabecera permanece.

## Integraciones

| Servicio | Uso |
|----------|-----|
| Login (USR5) | Validar token JWT |
| Bitácoras (GEN1) | Registrar operaciones (mejor esfuerzo) |
| Cursos | Confirmar existencia del curso y obtener carrera |
| Grupos | Confirmar existencia, curso asociado y cupo |
| Períodos | Confirmar existencia y estado del período |
| Parámetros | Obtener `PAGSIZE` para paginación |

## Configuración

Claves principales en `appsettings.json` / variables de entorno:

- `ConnectionStrings:Matriculas` → Cadena de conexión a `Matriculas_DB`.
- `Servicios:LoginUrl` → URL base de MicroservicioLogin.
- `Servicios:BitacoraUrl` → URL base de MicroservicioBitacoras.
- `Servicios:CursoUrl` → URL base de MicroservicioCursos.
- `Servicios:GrupoUrl` → URL base de MicroservicioGrupos.
- `Servicios:PeriodoUrl` → URL base de MicroservicioPeriodos.
- `Servicios:ParametroUrl` → URL base de MicroservicioParametros.

> **Nota de seguridad:** No versionar contraseñas ni credenciales. Usar variables de entorno o secretos de Plesk en producción.

## Base de datos

**Base de datos:** `Matriculas_DB`  
Tablas principales: `Matriculas` (cabecera), `MatriculasXCursos` (detalles).

## Ejecución local

```bash
dotnet run --project Backend/MicroservicioMatriculas/MicroservicioMatriculas.csproj
```

## Respuestas y errores comunes

| Código | Cuándo ocurre |
|--------|---------------|
| 200 OK | Consulta o modificación exitosa |
| 201 Created | Matrícula creada o reactivada |
| 204 No Content | Detalle eliminado lógicamente |
| 400 Bad Request | Datos inválidos, grupo no pertenece al curso, período inactivo o intento de modificar campo inmutable |
| 401 Unauthorized | Token o `X-Usuario-Id` ausente/inválido |
| 404 Not Found | Matrícula, estudiante, curso, grupo o período no encontrado |
| 409 Conflict | Curso duplicado en la matrícula o grupo sin cupo |
| 500 Internal Server Error | Error técnico no controlado |

## Diagrama de clases

![Diagrama de Clases Matrículas](../../Documentacion/Diagramas%20Generales/Clases/Microservicios/DiagramaClases_AdministracionMatricula.png)

---

*Documentación estandarizada del microservicio MicroservicioMatriculas (MAT2).*
